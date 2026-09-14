create table public.product_external_mappings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  external_ref text not null,
  provider text not null,
  created_at timestamptz not null default now(),
  constraint product_external_mappings_provider_ref_key unique (provider, external_ref)
);

create index product_external_mappings_product_id_idx on public.product_external_mappings(product_id);

-- Seed mapping data for known Lynk addons
with mapping_data(provider, external_ref, product_key) as (
  values 
    ('lynk', '6a4fcce90ee055ce5ab73524-5967-1170650561-1783614697738', 'utrt-4-anak-digital'),
    ('lynk', '6a4fcce90ee055ce5ab73525-6148-3773209971-1783614697745', 'utrt-2-cetak')
)
insert into public.product_external_mappings (product_id, external_ref, provider)
select p.id, m.external_ref, m.provider
from mapping_data m
join public.products p on p.product_key = m.product_key
on conflict (provider, external_ref) do nothing;
