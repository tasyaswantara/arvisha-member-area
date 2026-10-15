-- 1. Insert standalone products for LDR Addons
insert into public.products (
  product_key,
  provider,
  name,
  external_product_ref,
  is_active,
  price,
  thumbnail_url,
  purchase_url,
  product_type,
  description
)
values
  (
    'ut-ldr-nostalgia-masa-depan-digital',
    'lynk',
    '[1 EDISI] Ular Tangga Virtual LDR Edisi Nostalgia & Masa Depan by @ceritapejuangldr',
    '6985e90d938f72825acb607a-2478-5255947909-1770383629394',
    true,
    49000,
    '/images/LDR Triple Pack.png',
    'https://lynk.id/arvisha/wjozkojl7xvp',
    'base',
    'Miliki 1 edisi seru permainan Nostalgia & Masa Depan untuk mengenang momen indah dan merencanakan masa depan bersama pasangan LDR-mu.'
  ),
  (
    'ut-ldr-this-or-that-digital',
    'lynk',
    '[1 EDISI] Ular Tangga Virtual LDR Edisi This Or That by @ceritapejuangldr',
    '69983fa01fbcff965c75d8e3-1999-7687502671-1771585440800',
    true,
    49000,
    '/images/LDR Complete Pack.png',
    'https://lynk.id/arvisha/wjozkojl7xvp',
    'base',
    'Miliki 1 edisi seru permainan This or That untuk mengenal preferensi dan mempererat kecocokan bersama pasangan LDR-mu.'
  )
on conflict (product_key) do update
set
  provider = excluded.provider,
  name = excluded.name,
  external_product_ref = excluded.external_product_ref,
  is_active = excluded.is_active,
  price = excluded.price,
  thumbnail_url = excluded.thumbnail_url,
  purchase_url = excluded.purchase_url,
  product_type = excluded.product_type,
  description = excluded.description,
  updated_at = now();

-- 2. Map products to contents
with content_mapping(product_key, content_key) as (
  values
    ('ut-ldr-nostalgia-masa-depan-digital', 'ut-ldr-nostalgia-masa-depan'),
    ('ut-ldr-this-or-that-digital', 'ut-ldr-this-or-that')
)
insert into public.product_contents (product_id, content_id)
select p.id, c.id
from content_mapping mapping
join public.products p on p.product_key = mapping.product_key
join public.contents c on c.content_key = mapping.content_key
on conflict (product_id, content_id) do nothing;

-- 3. Seed product_external_mappings
with mapping_data(provider, external_ref, product_key) as (
  values
    ('lynk', '6985e90d938f72825acb607a-2478-5255947909-1770383629394', 'ut-ldr-nostalgia-masa-depan-digital'),
    ('lynk', '69983fa01fbcff965c75d8e3-1999-7687502671-1771585440800', 'ut-ldr-this-or-that-digital')
)
insert into public.product_external_mappings (product_id, external_ref, provider)
select p.id, m.external_ref, m.provider
from mapping_data m
join public.products p on p.product_key = m.product_key
on conflict (provider, external_ref) do nothing;

-- 4. Update transaction_items yang sebelumnya gagal terhubung (product_id null)
update public.transaction_items
set 
  product_id = (select id from public.products where product_key = 'ut-ldr-nostalgia-masa-depan-digital' limit 1),
  unit_amount = coalesce(unit_amount, 49000)
where external_product_ref = '6985e90d938f72825acb607a-2478-5255947909-1770383629394'
  and (product_id is null or unit_amount is null);

update public.transaction_items
set 
  product_id = (select id from public.products where product_key = 'ut-ldr-this-or-that-digital' limit 1),
  unit_amount = coalesce(unit_amount, 49000)
where external_product_ref = '69983fa01fbcff965c75d8e3-1999-7687502671-1771585440800'
  and (product_id is null or unit_amount is null);

-- 5. Berikan akses langsung ke member yang transaksinya sudah terupdate di atas
do $$
declare
  _item record;
begin
  for _item in (
    select distinct ti.product_id, ti.id as item_id, m.id as member_id
    from public.transaction_items ti
    join public.transactions t on t.id = ti.transaction_id
    join public.members m on m.customer_id = t.customer_id
    where ti.external_product_ref in (
      '6985e90d938f72825acb607a-2478-5255947909-1770383629394',
      '69983fa01fbcff965c75d8e3-1999-7687502671-1771585440800'
    )
    and ti.product_id is not null
    and t.status = 'successful'
  ) loop
    insert into public.product_access (
      member_id,
      product_id,
      status,
      granted_at,
      source_transaction_item_id,
      last_evaluated_at
    )
    values (
      _item.member_id,
      _item.product_id,
      'active',
      now(),
      _item.item_id,
      now()
    )
    on conflict (member_id, product_id) do update
    set last_evaluated_at = now();
  end loop;
end $$;
