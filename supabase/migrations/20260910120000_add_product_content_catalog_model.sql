-- Arvisha Member Area: product catalog metadata and product/content mapping.
--
-- This migration extends the existing product catalog and adds reusable content
-- units without changing product_access, transaction processing, or webhook
-- behavior. Product/content writes remain server-side for a later phase.

alter table public.products
  add column price numeric,
  add column thumbnail_url text,
  add column purchase_url text,
  add column product_type text not null default 'base';

alter table public.products
  add constraint products_price_check check (
    price is null or price >= 0
  ),
  add constraint products_thumbnail_url_check check (
    thumbnail_url is null or btrim(thumbnail_url) <> ''
  ),
  add constraint products_purchase_url_check check (
    purchase_url is null or btrim(purchase_url) <> ''
  ),
  add constraint products_product_type_check check (
    product_type in ('base', 'bundle', 'addon')
  );

comment on column public.products.price is
  'Catalog price for display and purchase metadata; this is not a transaction amount.';

comment on column public.products.thumbnail_url is
  'Optional catalog thumbnail URL. Product media is not inferred from provider payloads.';

comment on column public.products.purchase_url is
  'Optional provider purchase URL. It is distinct from any post-purchase content URL.';

comment on column public.products.product_type is
  'Catalog product kind: base, bundle, or addon.';

create table public.contents (
  id uuid primary key default gen_random_uuid(),
  content_key text not null,
  name text not null,
  content_type text not null,
  embed_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contents_content_key_check check (btrim(content_key) <> ''),
  constraint contents_name_check check (btrim(name) <> ''),
  constraint contents_content_type_check check (content_type in ('digital', 'print')),
  constraint contents_embed_url_check check (
    embed_url is null or btrim(embed_url) <> ''
  ),
  constraint contents_content_key_key unique (content_key)
);

comment on table public.contents is
  'Reusable product content metadata. Access is granted through product_access, not this table.';

comment on column public.contents.embed_url is
  'Optional digital-content embed URL. Print content does not require an embed URL.';

create table public.product_contents (
  product_id uuid not null references public.products(id) on delete cascade,
  content_id uuid not null references public.contents(id) on delete cascade,
  constraint product_contents_product_content_key unique (product_id, content_id)
);

comment on table public.product_contents is
  'Many-to-many mapping between catalog products and reusable content units.';

create index product_contents_content_id_idx
  on public.product_contents (content_id);

alter table public.contents enable row level security;
alter table public.product_contents enable row level security;

create policy contents_select_active
  on public.contents
  for select
  to authenticated
  using (is_active = true);

create policy product_contents_select_active
  on public.product_contents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = product_contents.product_id
        and products.is_active = true
    )
    and exists (
      select 1
      from public.contents
      where contents.id = product_contents.content_id
        and contents.is_active = true
    )
  );

revoke all on table
  public.contents,
  public.product_contents
from public, anon, authenticated;

grant select on table
  public.contents,
  public.product_contents
to authenticated;

grant all on table
  public.contents,
  public.product_contents
to service_role;
