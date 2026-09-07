# Arvisha Member Area — Phase 4A Migration Review

## 1. Migration

Migration file:

`supabase/migrations/20260907143357_create_member_area_schema.sql`

The migration is self-contained for a Supabase PostgreSQL database where the standard `auth.users` table and Supabase roles already exist. It does not create or alter `auth.users`.

The migration adds no triggers, functions, RPCs, authentication flow, webhook processing, access calculation, or seed data. `updated_at` values are application-managed for now.

## 2. Tables created

The migration creates exactly these seven application tables:

1. `public.customers`
2. `public.members`
3. `public.products`
4. `public.transactions`
5. `public.transaction_items`
6. `public.webhook_events`
7. `public.product_access`

### Relationships

- `members.id` references `auth.users.id` one-to-one.
- `members.customer_id` optionally references `customers.id`.
- `customers` have many `transactions`.
- `transactions` have many `transaction_items`.
- `transaction_items` optionally reference `products` until a trusted provider mapping exists.
- `webhook_events` may reference a `transaction`.
- `product_access` connects members and products with one current row per pair.
- `product_access.source_transaction_item_id` optionally records the transaction item that supplied the current entitlement.

## 3. Important constraints

- All application tables use UUID primary keys, except `members`, whose UUID is the Supabase Auth user ID.
- Provider/customer, provider/transaction, and internal product identifiers have uniqueness constraints.
- `members.customer_id` is unique when present.
- Transaction status is restricted to `pending`, `successful`, `cancelled`, `failed`, `refunded`, or `unknown`.
- Webhook processing status is restricted to `received`, `processing`, `processed`, `failed`, or `ignored`.
- Product access status is restricted to `active` or `revoked`.
- Transaction and item amounts cannot be negative when present.
- Transaction item quantities must be greater than zero.
- A transaction item fingerprint is unique within its transaction.
- Product access has one row per `(member_id, product_id)`.
- A revoked product access row must have `revoked_at`; an active row must not have `revoked_at`.
- Product access `valid_until` and `revoked_at` cannot precede `granted_at` when present.
- No business logic is implemented in database triggers.

## 4. Important indexes

- Partial unique index on `members(customer_id)`.
- Lookup index on `customers(provider, email_normalized)`.
- Partial unique index on `products(provider, external_product_ref)`.
- Unique provider/external transaction constraint.
- `transactions(customer_id, status)` and `transactions(status, occurred_at)` indexes.
- Transaction item product lookup index.
- Partial unique webhook indexes for provider/event ID and provider/payload hash fallback.
- Webhook processing-status and transaction lookup indexes.
- Product access product lookup and member/status lookup indexes.
- Unique member/product product-access constraint.

## 5. RLS and member-readable tables

RLS is enabled on all seven tables.

Authenticated members can currently read:

- Their own row in `public.members`, where `members.id = auth.uid()`.
- Active rows in `public.products`.
- Their own rows in `public.product_access`, where `product_access.member_id = auth.uid()`.

The following tables have no client-facing RLS policies and are server-only:

- `public.customers`
- `public.transactions`
- `public.transaction_items`
- `public.webhook_events`

There are no authenticated INSERT, UPDATE, or DELETE policies. Members cannot edit their profile yet because profile-editing requirements are not finalized.

The Phase 3 architecture allowed member transaction reads where appropriate; Phase 4A intentionally narrows transactions to server-only because no transaction-history feature is in scope yet. A later phase must add an explicit ownership policy if transaction history becomes member-facing.

## 6. Grants

- `anon`: no table privileges.
- `authenticated`: `SELECT` only on `members`, `products`, and `product_access`.
- `authenticated`: no INSERT, UPDATE, or DELETE privileges.
- `service_role`: full table privileges for trusted server-side operations.
- No credentials are stored in the migration.

The `service_role` credential must remain server-only and must never be placed in a `NEXT_PUBLIC_*` environment variable or client bundle.

## 7. Foreign-key deletion behavior

- Deleting an Auth user cascades to their `members` row.
- Deleting a member cascades to current `product_access` rows because an entitlement cannot exist without its member.
- Deleting a customer is restricted while a member or transaction references it.
- Deleting a transaction is restricted while transaction items reference it.
- Deleting a product is restricted while transaction items or product access reference it.
- Deleting a transaction sets `webhook_events.transaction_id` to null so the webhook audit record can remain.
- Deleting a transaction item sets `product_access.source_transaction_item_id` to null so current entitlement state is not accidentally removed.

These choices preserve historical customer, transaction, item, product, and webhook data. The migration does not include cleanup or retention jobs.

## 8. Security decisions

- RLS is enabled regardless of whether a table currently has a member-facing policy.
- No broad `USING (true)` authenticated policies are used.
- Members cannot read customer provider data, transactions, transaction items, or raw webhook payloads.
- Members cannot grant, revoke, or modify their own product access.
- Members cannot modify products, transactions, webhook events, or customer associations.
- Product visibility is not product access. Active products are readable for a future locked-product catalog, while `product_access` remains the authorization boundary.
- Database uniqueness constraints support webhook idempotency and prevent duplicate current entitlements.
- Provider statuses are retained separately from the controlled internal transaction status.
- Unknown product mappings and transaction statuses are stored for trusted processing but do not receive client-side authority from this migration.

## 9. Assumptions and unresolved questions

- Supabase's standard `auth.users`, `authenticated`, `anon`, and `service_role` objects exist.
- `gen_random_uuid()` is available in the target Supabase PostgreSQL environment.
- Provider identifiers can be stored safely as text; exact Lynk.id payload fields remain unconfirmed.
- `external_customer_ref` is required because customer records need a stable provider identity before registration.
- Email normalization rules, status mappings, webhook signature verification, event ordering, refund behavior, product visibility, account creation policy, and data retention remain unresolved.
- The webhook payload is retained as JSONB, but no webhook handler or validation logic is implemented.
- `service_role` is the trusted server role for the purposes of grants; no secret is configured or exposed by this phase.

## 10. Intentionally not implemented

This Phase 4A change does not implement:

- Authentication
- Registration or eligibility validation
- Login or password reset
- Auth hooks or automatic member creation
- Lynk.id integration
- Webhook verification or processing
- Product mapping logic
- Product access calculation or reconciliation
- Refund/cancellation processing
- API routes or server actions
- Frontend or dashboard UI
- CMS/admin functionality
- Game functionality
- Seed, fake, or test data
- Local Supabase startup
- Remote Supabase linking, pulling, or pushing

The pre-existing `supabase/seed.sql` placeholder was not modified and contains no seed data.

## Remote Supabase status

**PHASE 4A does not push or modify the remote Supabase project.**

No `supabase link`, `supabase db push`, `supabase db pull`, `supabase start`, or remote migration command was run.
