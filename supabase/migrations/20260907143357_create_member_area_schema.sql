-- Arvisha Member Area: initial database schema and RLS boundary.
--
-- This migration creates the seven application tables approved in the Phase 3
-- architecture document. It stores provider data and current product access,
-- but does not implement authentication, webhook processing, access
-- calculation, triggers, functions, or seed data.
--
-- Security model:
--   * authenticated members can read their own member and product_access rows;
--   * authenticated members can read active product catalog rows;
--   * customer, transaction, item, and webhook data are server-only;
--   * service_role is granted the trusted server privileges and must never be
--     exposed to the browser.
--
-- Important assumptions:
--   * auth.users already exists in a Supabase project;
--   * provider status mapping and webhook processing will be implemented later;
--   * updated_at is application-managed for now; no business trigger is added.

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_customer_ref text not null,
  email text,
  email_normalized text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_provider_check check (btrim(provider) <> ''),
  constraint customers_external_customer_ref_check check (btrim(external_customer_ref) <> ''),
  constraint customers_email_normalized_check check (
    email_normalized is null or btrim(email_normalized) <> ''
  ),
  constraint customers_provider_external_customer_ref_key
    unique (provider, external_customer_ref)
);

comment on table public.customers is
  'Provider-side customer identities. Server-side integration data; not member-readable.';

create table public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete restrict,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_full_name_check check (btrim(full_name) <> '')
);

comment on table public.members is
  'Application member profile linked one-to-one with auth.users.';

create table public.products (
  id uuid primary key default gen_random_uuid(),
  product_key text not null,
  provider text not null,
  name text not null,
  description text,
  external_product_ref text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_product_key_check check (btrim(product_key) <> ''),
  constraint products_provider_check check (btrim(provider) <> ''),
  constraint products_name_check check (btrim(name) <> ''),
  constraint products_external_product_ref_check check (
    external_product_ref is null or btrim(external_product_ref) <> ''
  ),
  constraint products_product_key_key unique (product_key)
);

comment on table public.products is
  'Internal product catalog identity and member-visible metadata.';

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_transaction_id text not null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null,
  provider_status text,
  currency text,
  total_amount numeric,
  occurred_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_provider_check check (btrim(provider) <> ''),
  constraint transactions_external_transaction_id_check check (
    btrim(external_transaction_id) <> ''
  ),
  constraint transactions_status_check check (
    status in ('pending', 'successful', 'cancelled', 'failed', 'refunded', 'unknown')
  ),
  constraint transactions_total_amount_check check (
    total_amount is null or total_amount >= 0
  ),
  constraint transactions_provider_external_transaction_id_key
    unique (provider, external_transaction_id)
);

comment on table public.transactions is
  'Canonical provider transaction records. Server-only until a later member history feature is approved.';

create table public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete restrict,
  product_id uuid references public.products(id) on delete restrict,
  external_product_ref text,
  provider_line_item_ref text,
  item_fingerprint text not null,
  quantity integer not null,
  unit_amount numeric,
  created_at timestamptz not null default now(),
  constraint transaction_items_item_fingerprint_check check (
    btrim(item_fingerprint) <> ''
  ),
  constraint transaction_items_quantity_check check (quantity > 0),
  constraint transaction_items_unit_amount_check check (
    unit_amount is null or unit_amount >= 0
  ),
  constraint transaction_items_external_product_ref_check check (
    external_product_ref is null or btrim(external_product_ref) <> ''
  ),
  constraint transaction_items_transaction_fingerprint_key
    unique (transaction_id, item_fingerprint)
);

comment on table public.transaction_items is
  'Normalized provider transaction lines. Unmapped items do not grant product access.';

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text,
  event_type text,
  payload_hash text not null,
  payload jsonb not null,
  processing_status text not null,
  transaction_id uuid references public.transactions(id) on delete set null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text,
  constraint webhook_events_provider_check check (btrim(provider) <> ''),
  constraint webhook_events_external_event_id_check check (
    external_event_id is null or btrim(external_event_id) <> ''
  ),
  constraint webhook_events_payload_hash_check check (btrim(payload_hash) <> ''),
  constraint webhook_events_processing_status_check check (
    processing_status in ('received', 'processing', 'processed', 'failed', 'ignored')
  )
);

comment on table public.webhook_events is
  'Append-oriented provider webhook inbox and idempotency/audit record.';

create table public.product_access (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  status text not null,
  granted_at timestamptz not null default now(),
  valid_until timestamptz,
  revoked_at timestamptz,
  source_transaction_item_id uuid references public.transaction_items(id) on delete set null,
  last_evaluated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_access_status_check check (status in ('active', 'revoked')),
  constraint product_access_status_timestamps_check check (
    (status = 'active' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  ),
  constraint product_access_valid_until_check check (
    valid_until is null or valid_until >= granted_at
  ),
  constraint product_access_revoked_at_check check (
    revoked_at is null or revoked_at >= granted_at
  ),
  constraint product_access_member_product_key unique (member_id, product_id)
);

comment on table public.product_access is
  'Current product entitlement per member. Access changes are trusted server operations only.';

-- Lookup and reconciliation indexes.
create unique index members_customer_id_key
  on public.members (customer_id)
  where customer_id is not null;

create index customers_provider_email_normalized_idx
  on public.customers (provider, email_normalized)
  where email_normalized is not null;

create unique index products_provider_external_product_ref_key
  on public.products (provider, external_product_ref)
  where external_product_ref is not null;

create index transactions_customer_status_idx
  on public.transactions (customer_id, status);

create index transactions_status_occurred_at_idx
  on public.transactions (status, occurred_at);

create index transaction_items_product_id_idx
  on public.transaction_items (product_id);

create unique index webhook_events_provider_external_event_id_key
  on public.webhook_events (provider, external_event_id)
  where external_event_id is not null;

-- The hash is the fallback idempotency key when a provider event ID is absent.
create unique index webhook_events_provider_payload_hash_key
  on public.webhook_events (provider, payload_hash)
  where external_event_id is null;

create index webhook_events_processing_status_idx
  on public.webhook_events (processing_status);

create index webhook_events_transaction_id_idx
  on public.webhook_events (transaction_id);

create index product_access_product_id_idx
  on public.product_access (product_id);

create index product_access_member_status_idx
  on public.product_access (member_id, status);

-- RLS is enabled on every application table. No permissive policy is created
-- for server-only tables, so authenticated and anonymous clients remain denied.
alter table public.members enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.webhook_events enable row level security;
alter table public.product_access enable row level security;

create policy members_select_own
  on public.members
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy products_select_active
  on public.products
  for select
  to authenticated
  using (is_active = true);

create policy product_access_select_own
  on public.product_access
  for select
  to authenticated
  using (member_id = (select auth.uid()));

-- Make the Data API boundary explicit. No anon privileges are granted, and
-- authenticated receives only the three member-facing SELECT capabilities.
revoke all on table
  public.members,
  public.customers,
  public.products,
  public.transactions,
  public.transaction_items,
  public.webhook_events,
  public.product_access
from public, anon, authenticated;

grant select on table public.members to authenticated;
grant select on table public.products to authenticated;
grant select on table public.product_access to authenticated;

-- service_role is a server-only Supabase role. Its credential must never be
-- exposed through NEXT_PUBLIC_* variables or shipped to the browser.
grant all on table
  public.members,
  public.customers,
  public.products,
  public.transactions,
  public.transaction_items,
  public.webhook_events,
  public.product_access
to service_role;
