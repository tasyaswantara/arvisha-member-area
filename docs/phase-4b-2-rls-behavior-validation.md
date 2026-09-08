# Arvisha Member Area — Phase 4B-2 RLS Behavior Validation

## 1. Environment

- Existing local Supabase Docker environment was reused; it was healthy before testing.
- Local PostgreSQL container: `supabase_db_member-area`.
- Local Supabase stack was not started, reset, linked, pushed, pulled, or modified during this phase.
- Tests ran directly against the local PostgreSQL database using the existing `anon`, `authenticated`, and `service_role` database roles.
- No production credentials, remote keys, or service-role secrets were used or printed.

## 2. Test Identities and Setup

Two synthetic local Auth identities were created inside one database transaction:

- User A / Member A
- User B / Member B

The transaction also created temporary member, active/inactive product, product-access, customer, transaction, transaction-item, and webhook rows. Authenticated tests set the local `request.jwt.claim.sub` value to each synthetic Auth user ID in turn.

The test identities and all temporary rows were rolled back at the end of the suite. No permanent business data was created.

## 3. Members RLS Tests

Policy tested: `members_select_own` (`authenticated` SELECT, `id = auth.uid()`).

| Test | Expected result | Actual result | Status |
|---|---|---|---|
| User A selects `members` | Sees only User A's row | Exactly 1 row | PASS |
| User A selects User B's row | No rows returned | 0 rows | PASS |
| User B selects `members` | Sees only User B's row | Exactly 1 row | PASS |
| User B selects User A's row | No rows returned | 0 rows | PASS |

## 4. Products RLS Tests

Policy tested: `products_select_active` (`authenticated` SELECT, `is_active = true`).

| Test | Expected result | Actual result | Status |
|---|---|---|---|
| Authenticated User A selects products | Active products are visible | 1 active product returned | PASS |
| Authenticated User A selects inactive product | Inactive product is hidden | 0 rows returned | PASS |

Product visibility was tested independently of product ownership, as required by the approved policy.

## 5. Product Access RLS Tests

Policy tested: `product_access_select_own` (`authenticated` SELECT, `member_id = auth.uid()`).

| Test | Expected result | Actual result | Status |
|---|---|---|---|
| User A selects `product_access` | Sees only User A's row | Exactly 1 row | PASS |
| User A selects User B's access row | No rows returned | 0 rows | PASS |
| User B selects `product_access` | Sees only User B's row | Exactly 1 row | PASS |
| User B selects User A's access row | No rows returned | 0 rows | PASS |

## 6. Server-Only Table Tests

Relevant grant boundary: `authenticated` has no SELECT privilege on these tables; no authenticated policies exist.

| Table | Expected result | Actual result | Status |
|---|---|---|---|
| `customers` | Authenticated SELECT denied | Permission denied | PASS |
| `transactions` | Authenticated SELECT denied | Permission denied | PASS |
| `transaction_items` | Authenticated SELECT denied | Permission denied | PASS |
| `webhook_events` | Authenticated SELECT denied | Permission denied | PASS |

## 7. Write Privilege Tests

Relevant grant boundary: `authenticated` has no INSERT, UPDATE, or DELETE privileges and no write policies.

Actual permission-denial tests passed for all nine operations below:

- `members`: INSERT, UPDATE, DELETE
- `products`: INSERT, UPDATE, DELETE
- `product_access`: INSERT, UPDATE, DELETE

Privilege metadata checks also confirmed that `authenticated` has no INSERT, UPDATE, or DELETE privileges on the server-only tables:

- `customers`
- `transactions`
- `transaction_items`
- `webhook_events`

## 8. Anon Role Tests

Relevant grant boundary: `anon` has no privileges on the application tables.

Actual SELECT attempts were denied for all seven application tables:

- `customers`
- `members`
- `products`
- `transactions`
- `transaction_items`
- `webhook_events`
- `product_access`

All anon SELECT tests: PASS.

## 9. Service-Role Test

The local `service_role` database role was tested directly with `SET ROLE`; no service-role key or secret was used.

- `service_role` successfully selected all seven application tables and saw the temporary rows, including server-only rows.
- `service_role` retained INSERT, UPDATE, and DELETE table privileges on all seven application tables.
- No service-role write was performed; the test verified access without mutating data.

Result: PASS.

## 10. Cleanup Confirmation

The test transaction ended with `ROLLBACK`. A post-test local catalog/data check found zero leftover rows for all synthetic Auth and application identifiers:

- `auth.users`: 0
- `customers`: 0
- `members`: 0
- `products`: 0
- `transactions`: 0
- `transaction_items`: 0
- `webhook_events`: 0
- `product_access`: 0

## 11. Issues Discovered

No RLS, policy, or grant defects were discovered. An initial test-harness statement omitted an INSERT column list and was corrected before the final suite; its aborted transaction was rolled back and verified clean. The approved migration and application code were not modified.

No RLS behavior tests were run against Supabase Cloud.

## 12. Overall Result

PASS

The approved Phase 4A RLS policies and grants behaved as intended in the local Supabase database. Phase 4B-2 is complete. No further phase was started automatically.
