# Arvisha Member Area — Database Architecture

Status: proposed architecture for Phase 3. This document does not create tables, migrations, RLS policies, seed data, or Supabase changes.

The three supplied UI images are treated as future design references only. They do not change the scope of this phase.

## 1. Project database overview

The database should separate four concerns:

1. **Supabase Auth** — identity and credentials owned by Supabase in `auth.users`.
2. **Application member data** — the member profile and the association to an external customer identity.
3. **Lynk.id integration data** — imported customer records, transactions, transaction items, and immutable webhook events.
4. **Product access data** — the current member-to-product entitlement used by the member area.

The application should treat trusted transaction data as the source of truth for product access. A frontend must never be able to grant or revoke access by changing a flag.

The proposed design uses UUID primary keys for internal entities and stores provider identifiers separately as external references. This keeps the application model independent from Lynk.id while preserving the identifiers needed for reconciliation and idempotency.

## 2. Business flow

### Purchase and webhook flow

```text
Customer purchases a product
        |
        v
Lynk.id creates or updates a transaction
        |
        v
Lynk.id sends a webhook to a server-only endpoint
        |
        v
Arvisha verifies the webhook and stores the raw event once
        |
        v
Arvisha maps the customer, transaction, and product references
        |
        v
The transaction is upserted and its canonical status is recalculated
        |
        v
Product access is granted, retained, or revoked server-side
        |
        v
The member dashboard reads the resulting access state
```

The exact webhook payload, signature scheme, event identifier, product identifier, and status values must be confirmed during the Lynk.id integration phase. The schema therefore uses provider-neutral names such as `external_transaction_id`, `provider_status`, and `external_product_ref`, plus a retained raw payload.

### Registration flow

```text
User submits registration details
        |
        v
Server normalizes the email and checks eligibility
        |
        v
Server finds a matching customer with qualifying transaction data
        |
        v
Server creates or associates the Supabase Auth user
        |
        v
Server creates the member profile linked to that customer
        |
        v
Server derives current product access from qualifying transactions
```

Eligibility must be checked on the server against trusted records. A public client must not be able to create an arbitrary member profile or bypass the customer check.

## 3. Entity relationship explanation

Supabase Auth supplies one identity per member. The application profile uses the Auth user UUID as its own primary key, creating a one-to-one relationship without copying passwords or treating an email address as the permanent identity.

Lynk.id customers are separate because a customer and an Auth user can exist at different times. A customer record may be created by a webhook before the customer registers. After registration, the member profile links to that customer record.

Transactions belong to external customers and contain one or more transaction items. Items point to internally defined products when the provider reference has been mapped. Product access is a current-state member/product entitlement derived from qualifying transactions.

### Text ERD

```text
auth.users
    1
    |
    | id = members.id
    |
    1
members -------------------- 0..1 customers
    |                              |
    |                              | 1
    |                              |
    |                              | many
    |                         transactions
    |                              |
    |                              | 1
    |                              |
    |                              | many
    |                       transaction_items
    |                              |
    |                              | many-to-one, after mapping
    |                              v
    |                           products
    |
    | 1
    |
    | many
product_access ---------------- products

webhook_events -> records provider events and may reference a transaction
```

The member-to-product relationship is many-to-many. `product_access` is the junction/entitlement table that represents the current state of that relationship.

## 4. Proposed tables

These are proposals only. Exact names and columns should be finalized before migrations are written.

### 4.1 `members`

Purpose: application profile for a Supabase Auth user.

- **Primary key:** `id uuid`, equal to `auth.users.id`.
- **Important columns:**
  - `id`
  - `customer_id uuid`, nullable until the registration association is completed
  - `full_name text`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- **Foreign keys:** `id -> auth.users.id`; `customer_id -> customers.id`.
- **Constraints:** unique `customer_id` when non-null so one imported customer cannot claim multiple member accounts by accident.
- **Indexes:** unique index on `customer_id` where it is not null; the primary key covers lookups by Auth user.
- **Relationships:** one-to-one with `auth.users`; optionally linked to one imported customer; one-to-many with transactions through the member's customer association; one-to-many with product access.
- **Read access:** an authenticated member may read only their own row.
- **Write access:** trusted registration/server code creates the row. A member may later update only explicitly approved profile fields, such as `full_name`, if that is allowed by policy. The client must not set `customer_id`, access state, or ownership fields.

The Auth email remains owned by Supabase Auth. Do not duplicate it in `members` as a second source of truth.

### 4.2 `customers`

Purpose: imported identity from Lynk.id, which can exist before a member registers.

- **Primary key:** internal `id uuid`.
- **Important columns:**
  - `id`
  - `provider text`, initially representing Lynk.id
  - `external_customer_ref text`, nullable until the provider identifier is confirmed
  - `email text`, the provider-supplied display/original value where appropriate
  - `email_normalized text`, generated by server-side normalization for matching
  - `display_name text`, nullable
  - `created_at timestamptz`
  - `updated_at timestamptz`
- **Foreign keys:** none required.
- **Constraints:** unique `(provider, external_customer_ref)` when the provider supplies a stable customer reference. Do not make email globally unique until Lynk.id identity rules are confirmed.
- **Indexes:** `(provider, email_normalized)`; partial unique index on `(provider, external_customer_ref)` when non-null.
- **Relationships:** one customer may have many transactions; one customer may be linked to at most one member through `members.customer_id`.
- **Read access:** no anonymous or member read access by default. Customer identity and email should not be exposed merely because someone is authenticated.
- **Write access:** webhook processing and other trusted server-side processes only.

Email matching must be deliberately defined. At minimum, trim surrounding whitespace and lowercase for comparison. Do not apply provider-specific Gmail-style transformations or other canonicalization without an approved policy.

### 4.3 `products`

Purpose: internal catalog identity and member-facing product metadata, independent of any one transaction.

- **Primary key:** internal `id uuid`.
- **Important columns:**
  - `id`
  - `product_key text`, an internally controlled stable key or slug
  - `provider text`, initially representing Lynk.id when an external mapping is present
  - `name text`
  - `description text`, nullable
  - `external_product_ref text`, nullable until the provider mapping is confirmed
  - `is_active boolean`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- **Foreign keys:** none required.
- **Constraints:** unique `product_key`; unique `(provider, external_product_ref)` when both values are non-null.
- **Indexes:** unique `product_key`; partial index on active products; index on `(provider, external_product_ref)` used during webhook processing.
- **Relationships:** one product may appear in many transaction items and many product access rows.
- **Read access:** authenticated members may read only the member-facing fields of active products if the product catalog should show locked products. Anonymous access is not required. If the catalog is private, restrict reads to products referenced by that member's access or transaction rows.
- **Write access:** no member write access. Future trusted CMS/server operations may create or update products.

Products should not be created implicitly from arbitrary webhook text. An unknown provider product should be retained as an unmapped transaction item and must not grant access until a trusted mapping exists.

### 4.4 `transactions`

Purpose: the canonical application record for an external Lynk.id transaction.

- **Primary key:** internal `id uuid`.
- **Important columns:**
  - `id`
  - `provider text`
  - `external_transaction_id text`
  - `customer_id uuid`
  - `status text`, an internal canonical status such as `pending`, `successful`, `cancelled`, `failed`, `refunded`, or `unknown`
  - `provider_status text`, the exact provider value retained without assuming its meaning
  - `currency text`, nullable until confirmed
  - `total_amount numeric`, nullable until confirmed
  - `occurred_at timestamptz`, nullable until a reliable provider timestamp is confirmed
  - `raw_payload jsonb`, subject to retention and PII review
  - `created_at timestamptz`
  - `updated_at timestamptz`
- **Foreign keys:** `customer_id -> customers.id`.
- **Constraints:** unique `(provider, external_transaction_id)`; check amount values are non-negative if amounts are stored; canonical status values should be controlled by the application rather than copied blindly from Lynk.id.
- **Indexes:** `(customer_id, status)`; `(provider, external_transaction_id)`; `(status, occurred_at)` for reconciliation; any index used by the registration eligibility query.
- **Relationships:** one customer has many transactions; one transaction has many transaction items; one transaction may be referenced by webhook events and by access recalculation logic.
- **Read access:** a member may read only their own transactions, joined through their linked customer. Expose only the fields needed by the member area.
- **Write access:** no client insert/update/delete. Trusted webhook and reconciliation code only.

The row stores the current canonical status. The append-only `webhook_events` table stores the provider events needed to explain status transitions and support idempotent processing.

### 4.5 `transaction_items`

Purpose: normalized product lines within a transaction. This avoids assuming that every transaction contains exactly one product.

- **Primary key:** internal `id uuid`.
- **Important columns:**
  - `id`
  - `transaction_id uuid`
  - `product_id uuid`, nullable while a provider reference is unmapped
  - `external_product_ref text`, the provider-facing product reference
  - `provider_line_item_ref text`, nullable if the provider does not supply one
  - `item_fingerprint text`, a deterministic server-generated deduplication key
  - `quantity integer`
  - `unit_amount numeric`, nullable
  - `created_at timestamptz`
- **Foreign keys:** `transaction_id -> transactions.id`; `product_id -> products.id` when mapped.
- **Constraints:** `quantity > 0`; unique `(transaction_id, item_fingerprint)`; optionally unique `(transaction_id, provider_line_item_ref)` where a stable line item reference exists.
- **Indexes:** `(transaction_id)`; `(product_id)`; `(external_product_ref)` for product mapping and reconciliation.
- **Relationships:** many items belong to one transaction; many items may refer to one product.
- **Read access:** only through a member's own transaction, if transaction line details are exposed.
- **Write access:** trusted server-side processing only.

The fingerprint must be generated from stable, verified provider fields. It must not be based on array position or other data that can change between webhook retries.

### 4.6 `webhook_events`

Purpose: immutable webhook inbox and processing audit record.

- **Primary key:** internal `id uuid`.
- **Important columns:**
  - `id`
  - `provider text`
  - `external_event_id text`, nullable if Lynk.id does not provide one
  - `event_type text`, nullable until confirmed
  - `payload_hash text`, generated server-side from a canonical payload representation
  - `payload jsonb`
  - `processing_status text`, for example `received`, `processed`, `ignored`, or `failed`
  - `transaction_id uuid`, nullable
  - `received_at timestamptz`
  - `processed_at timestamptz`, nullable
  - `error_message text`, nullable and sanitized
- **Foreign keys:** optional `transaction_id -> transactions.id`.
- **Constraints:** unique `(provider, external_event_id)` when an event ID exists. Use a unique provider/hash key as a fallback only when no provider event ID exists.
- **Indexes:** `(processing_status, received_at)`; `(transaction_id)`; provider/event ID lookup.
- **Relationships:** many provider events may refer to one transaction.
- **Read access:** no anonymous or member access. This table may contain sensitive payloads.
- **Write access:** server-side webhook handler only; records should be append-only except for controlled processing metadata updates.

This table is the first idempotency boundary. The handler should persist or claim the event before applying business effects. Duplicate deliveries should return a successful idempotent response without granting access twice.

### 4.7 `product_access`

Purpose: current member-to-product entitlement used for access decisions and UI state.

- **Primary key:** either internal `id uuid`, or the composite identity `(member_id, product_id)`. An internal UUID with a unique `(member_id, product_id)` constraint is easier to reference from future systems.
- **Important columns:**
  - `id`
  - `member_id uuid`
  - `product_id uuid`
  - `status text`, initially `active` or `revoked`
  - `granted_at timestamptz`
  - `valid_until timestamptz`, nullable for lifetime access
  - `revoked_at timestamptz`, nullable
  - `source_transaction_item_id uuid`, nullable but useful for product-level audit and reconciliation
  - `last_evaluated_at timestamptz`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- **Foreign keys:** `member_id -> members.id`; `product_id -> products.id`; optional `source_transaction_item_id -> transaction_items.id`.
- **Constraints:** unique `(member_id, product_id)`; valid timestamps; `revoked_at` required when status is revoked.
- **Indexes:** unique member/product key; `(member_id, status)`; `(product_id, status)`; `(valid_until)` for expiry reconciliation.
- **Relationships:** many access rows belong to one member and one product; this is the many-to-many junction between them.
- **Read access:** an authenticated member may read only rows with `member_id = auth.uid()`.
- **Write access:** no client insert/update/delete. Trusted server-side access recalculation only.

The table represents the current entitlement, not the complete purchase history. All qualifying transactions remain available as the source of truth. If the product later needs independent grants, stacking, seats, or overlapping entitlements, a separate append-only access-grants table can be introduced without changing the core transaction model.

## 5. Transaction lifecycle

### Ingestion and idempotency

1. Receive the webhook at a server-only endpoint.
2. Verify the provider signature or shared secret once the Lynk.id mechanism is confirmed.
3. Calculate a canonical payload hash and read the provider event identifier when available.
4. Insert the event into `webhook_events` using the event ID, or the hash fallback, as the idempotency key.
5. If the event was already processed, return an idempotent success and stop.
6. Upsert the customer using a stable provider reference when available. Use normalized email only as a carefully controlled fallback.
7. Upsert the transaction using `(provider, external_transaction_id)`.
8. Upsert transaction items using stable line references or server-generated fingerprints.
9. Map each provider product reference to a known internal product. Unknown mappings remain unresolved and cannot create access.
10. Update the canonical transaction status and mark the event processed in one controlled server-side operation.

### Status representation

Store both:

- `provider_status`: the exact value sent by Lynk.id, for support and future remapping.
- `status`: a small internal vocabulary used by access logic.

The internal vocabulary should cover at least `pending`, `successful`, `cancelled`, `failed`, `refunded`, and `unknown`. These are application concepts, not claims about Lynk.id's exact status names. The mapping must be confirmed during integration.

Status updates must be idempotent and resistant to stale or out-of-order events. If Lynk.id supplies an event timestamp or sequence, retain it and use it to reject older updates. If it does not, that limitation must be documented and reconciliation rules must be agreed before production use.

### Status effects

| Canonical status | Transaction is eligible for access? | Expected access effect |
| --- | --- | --- |
| `successful` | Yes, if the product is mapped | Grant or retain access |
| `pending` | No | Do not grant access yet |
| `cancelled` | No | Revoke or keep revoked, then re-evaluate other valid purchases |
| `failed` | No | Do not grant access |
| `refunded` | No for the refunded purchase | Revoke only if no other valid qualifying transaction remains |
| `unknown` | No | Quarantine for review; do not grant access |

The exact refund and partial-refund behavior remains an open question. A transaction should not be deleted when its status changes; its history and raw events are needed for audit and reconciliation.

## 6. Product access lifecycle

Access should be recalculated server-side from transaction items and canonical transaction status.

- A successful transaction with a mapped product creates or updates one `product_access` row for the linked member.
- A pending, failed, cancelled, or unknown transaction never grants access.
- A refund or cancellation triggers a re-evaluation of all other qualifying transactions for the same member/product before access is revoked.
- If no qualifying transaction remains, mark access revoked rather than deleting the historical entitlement row.
- If `valid_until` is used later, an expired row is not active even if the transaction itself was successful.
- An unresolved customer-to-member association means the transaction can be stored, but access cannot be attached to a member until the association is safely established.

The dashboard may show locked/unlocked UI states, but the server and RLS policies must enforce the same entitlement decision. A frontend condition is never an authorization boundary.

## 7. Registration eligibility flow

The registration endpoint should be server-controlled and race-safe:

1. Validate the submitted full name, email, password, and confirmation on the server.
2. Normalize the email using the approved matching policy.
3. Find a `customers` row with that normalized email or a verified external customer reference.
4. Confirm that the customer has at least one transaction with a canonical status of `successful` and a mapped product, unless the business later approves a different eligibility rule.
5. Confirm that the customer is not already linked to a member, or route the case to an explicit account-recovery flow.
6. Create the Auth user and member profile through trusted server logic. Do not accept a client-supplied `customer_id`.
7. Recalculate current product access from the customer's qualifying transactions.

The project should not rely on public Supabase `signUp` alone if public signups remain enabled, because a user could create an Auth account without passing the business eligibility check. Before implementation, decide whether public signup is disabled and accounts are created from a server-only flow, or whether an approved Supabase Auth hook/RPC design will enforce the same rule.

## 8. RLS and security model

RLS should be enabled on every application table exposed through the Supabase Data API. Policies should use `auth.uid()` and relationship checks; hiding routes in Next.js is not sufficient.

### Policy matrix

| Table | Anonymous | Authenticated member | Server/webhook | Client INSERT | Client UPDATE | Client DELETE |
| --- | --- | --- | --- | --- | --- | --- |
| `members` | No access | Select own row; optionally update approved profile fields only | Full controlled create/update | No | Limited own profile fields only, if desired | No |
| `customers` | No access | No direct access by default | Full trusted processing access | No | No | No; retention process only |
| `products` | No access | Select active/member-visible catalog rows, or only related rows depending on product privacy | Full controlled catalog access | No | No | No |
| `transactions` | No access | Select own customer-linked transactions where appropriate | Full trusted processing access | No | No | No |
| `transaction_items` | No access | Select only through an owned transaction, if needed | Full trusted processing access | No | No | No |
| `webhook_events` | No access | No access | Insert and controlled processing updates | No | No | No |
| `product_access` | No access | Select rows where `member_id = auth.uid()` | Full controlled grant/revoke access | No | No | No |

Additional security requirements:

- Never expose `auth.users` through application queries or the browser.
- Never put a Supabase secret/service-role credential in a `NEXT_PUBLIC_` variable or client bundle.
- The webhook endpoint must verify authenticity before any database mutation.
- The browser must not be able to write transaction status, customer association, product mapping, or access status.
- If a privileged server client bypasses RLS, keep it in server-only code and use it only for narrowly defined operations.
- Limit member transaction fields to what the member actually needs; raw webhook payloads should remain server-only because they may contain PII.
- Use database uniqueness constraints as well as application checks to prevent duplicate customers, transactions, events, and access rows.

## 9. Server-side vs client-side responsibilities

### Server-side only

- Lynk.id webhook receipt, signature verification, and idempotency.
- Parsing and mapping provider identifiers and statuses.
- Creating/updating customer and transaction records.
- Creating transaction items and resolving product mappings.
- Registration eligibility checks.
- Auth user/member association where it requires trusted access.
- Granting, revoking, and recalculating product access.
- Handling refunds, cancellations, reconciliation, and retries.
- Reading or storing raw webhook payloads.
- Any use of a secret/service-role credential.

### Browser/client allowed

- Submitting registration or login form data to the appropriate server/auth flow once those features are implemented.
- Reading the authenticated member's allowed profile, product, transaction, and access data through RLS.
- Rendering locked/unlocked states returned by the server.
- Updating only explicitly permitted member profile fields.

The browser must never calculate authoritative access or send a request that directly changes a transaction or entitlement.

## 10. Indexing considerations

Start with indexes that support identity matching, webhook idempotency, ownership checks, and access reads:

- `members.customer_id` unique partial index.
- `customers(provider, external_customer_ref)` unique partial index.
- `customers(provider, email_normalized)` lookup index.
- `products(product_key)` unique index.
- `products(external_product_ref)` lookup/partial unique index after provider mapping rules are confirmed.
- `transactions(provider, external_transaction_id)` unique index.
- `transactions(customer_id, status)` ownership and eligibility index.
- `transaction_items(transaction_id, item_fingerprint)` unique index.
- `transaction_items(external_product_ref)` mapping index.
- `webhook_events(provider, external_event_id)` unique partial index.
- `webhook_events(provider, payload_hash)` fallback idempotency index where applicable.
- `product_access(member_id, product_id)` unique index.
- `product_access(member_id, status)` dashboard lookup index.

Avoid adding indexes before the access and webhook query patterns are known. Review query plans after realistic data is available.

## 11. Future CMS extension considerations

CMS/admin is outside the current scope. The current design leaves room for it without creating admin tables now:

- Keep products identified by stable internal keys rather than transaction text.
- Keep catalog metadata separate from transaction and access facts.
- Keep all provider ingestion server-side so a future admin interface does not need to impersonate a webhook.
- Add roles/permissions and audit tables only when an admin workflow is approved.
- If admins need manual access grants, add an explicit access-grants/audit model instead of allowing direct edits to the current `product_access` state.
- If product content becomes complex, add separate content/version tables rather than overloading the transaction tables.

No CMS routes, tables, roles, or admin policies are proposed for this phase.

## 12. Open questions and assumptions

These must be confirmed before database implementation:

1. What is the exact Lynk.id webhook payload and signature verification method?
2. Does Lynk.id provide stable event, transaction, customer, and line-item identifiers?
3. Which provider status values map to the internal statuses proposed here?
4. Can webhooks arrive out of order, and is there an event timestamp or sequence number?
5. Is one successful purchase enough for eligibility, or are there product-specific eligibility rules?
6. Can one email represent multiple Lynk.id customers, and can a customer change email?
7. Is one Arvisha account allowed per customer, or is account merging/support required?
8. Are purchases lifetime, time-limited, recurring, bundled, or quantity-based?
9. What should happen for partial refunds, chargebacks, cancellations, and repeated purchases?
10. Should members see all active products, or only products they have purchased/accessed?
11. Will Supabase public signup be disabled in favor of server-controlled account creation?
12. Is email confirmation required before access is granted?
13. Which member profile fields may a member update directly?
14. How long may raw webhook payloads and customer PII be retained?
15. Will the first product mapping live on `products`, or should a separate provider-product mapping table be introduced?
16. What reconciliation or retry process is required when a webhook fails or a product mapping is added later?

Until these questions are answered, do not write migrations or rely on invented provider fields.

## 13. Recommended Phase 4 implementation order

1. Confirm the open Lynk.id and account-policy questions.
2. Finalize table names, constraints, retention decisions, and status mapping.
3. Write the initial migration for the approved tables only.
4. Enable RLS and add ownership policies for each exposed table.
5. Add server-only configuration for webhook processing; keep secrets out of public environment variables.
6. Implement the webhook inbox, idempotent transaction upsert, and product mapping flow.
7. Implement server-controlled registration eligibility and the member/customer association.
8. Implement access recalculation and refund/cancellation handling.
9. Implement Supabase Auth flows and protected routes.
10. Add tests for duplicate events, out-of-order status changes, revoked access, RLS isolation, and registration bypass attempts.

## Current phase boundary

This phase intentionally creates only this architecture document. It does not create SQL, tables, migrations, seed data, RLS policies, authentication, registration, Lynk.id integration, webhooks, UI, CMS/admin functionality, or mock transaction data.
