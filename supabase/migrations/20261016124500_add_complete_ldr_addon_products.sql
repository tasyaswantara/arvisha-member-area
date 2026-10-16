-- 1. Insert new content for LDR Date Carnival Night
insert into public.contents (
  content_key,
  name,
  content_type,
  embed_url,
  is_active
)
values (
  'ut-ldr-date-night-carnival',
  'LDR Date Night Carnival',
  'digital',
  'https://view.genially.com/6aa7c3efee0678d6333afefc',
  true
)
on conflict (content_key) do update
set
  name = excluded.name,
  content_type = excluded.content_type,
  embed_url = excluded.embed_url,
  is_active = excluded.is_active,
  updated_at = now();

-- 2. Insert and update standalone products for all LDR Addons
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
    '/images/LDR Edisi Nostalgia & Masa Depan.png',
    'https://lynk.id/arvisha/wjozkojl7xvp',
    'base',
    'Miliki 1 edisi seru permainan Nostalgia & Masa Depan untuk mengenang momen indah dan merencanakan masa depan bersama pasangan LDR-mu.'
  ),
  (
    'ut-ldr-pertanyaan-random-digital',
    'lynk',
    '[1 EDISI] Ular Tangga Virtual LDR Edisi Pertanyaan Random by @ceritapejuangldr',
    '6985e90d938f72825acb607b-9173-5643764782-1770383629400',
    true,
    49000,
    '/images/LDR Edisi Pertanyaan Random.png',
    'https://lynk.id/arvisha/wjozkojl7xvp',
    'base',
    'Miliki 1 edisi seru permainan Pertanyaan Random untuk mengobrol lebih dalam dan mengusir rasa rindu bersama pasangan LDR-mu.'
  ),
  (
    'ut-ldr-this-or-that-digital',
    'lynk',
    '[1 EDISI] Ular Tangga Virtual LDR Edisi This Or That by @ceritapejuangldr',
    '69983fa01fbcff965c75d8e3-1999-7687502671-1771585440800',
    true,
    49000,
    '/images/LDR Edisi This or That.png',
    'https://lynk.id/arvisha/wjozkojl7xvp',
    'base',
    'Miliki 1 edisi seru permainan This or That untuk mengenal preferensi dan mempererat kecocokan bersama pasangan LDR-mu.'
  ),
  (
    'ut-ldr-fun-challenge-digital',
    'lynk',
    '[1 EDISI] Ular Tangga Virtual LDR Edisi Fun Challenge by @ceritapejuangldr',
    '69983fa01fbcff965c75d8e4-6320-4585231426-1771585440805',
    true,
    49000,
    '/images/LDR Edisi Fun Challenge.png',
    'https://lynk.id/arvisha/wjozkojl7xvp',
    'base',
    'Miliki 1 edisi permainan tantangan seru Fun Challenge (Level Crazy) untuk menciptakan momen tawa dan keseruan bersama pasangan LDR-mu.'
  ),
  (
    'mb-ldr-truth-or-dare-digital',
    'lynk',
    '[1 EDISI] Mystery Box LDR Edisi Truth Or Dare by @ceritapejuangldr',
    '69983fa01fbcff965c75d8e5-5266-8130238397-1771585440810',
    true,
    49000,
    '/images/Mystery Box Edisi TOD.png',
    'https://lynk.id/arvisha/wjozkojl7xvp',
    'base',
    'Miliki 1 edisi permainan Mystery Box Truth or Dare yang penuh kejutan mendebarkan untuk dimainkan bersama pasangan LDR-mu.'
  ),
  (
    'ut-ldr-date-carnival-night-digital',
    'lynk',
    '[1 EDISI] LDR Date Carnival Night by @ceritapejuangldr',
    '6a60cbc39a3e5d34ec31ea4f-3352-8077211172-1784728515424',
    true,
    49000,
    '/images/LDR Edisi Date Night Carnival.png',
    'https://lynk.id/arvisha/ly9m66m49r0k',
    'base',
    'Miliki edisi spesial LDR Date Carnival Night untuk kencan virtual yang seru, romantis, dan tak terlupakan bersama pasangan LDR-mu.'
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

-- 3. Map products to contents
with content_mapping(product_key, content_key) as (
  values
    ('ut-ldr-nostalgia-masa-depan-digital', 'ut-ldr-nostalgia-masa-depan'),
    ('ut-ldr-pertanyaan-random-digital', 'ut-ldr-pertanyaan-random'),
    ('ut-ldr-this-or-that-digital', 'ut-ldr-this-or-that'),
    ('ut-ldr-fun-challenge-digital', 'ut-ldr-fun-challenge'),
    ('mb-ldr-truth-or-dare-digital', 'mb-ldr-truth-or-dare'),
    ('ut-ldr-date-carnival-night-digital', 'ut-ldr-date-night-carnival')
)
insert into public.product_contents (product_id, content_id)
select p.id, c.id
from content_mapping mapping
join public.products p on p.product_key = mapping.product_key
join public.contents c on c.content_key = mapping.content_key
on conflict (product_id, content_id) do nothing;

-- 4. Seed all external product mappings (including checkout bundle-specific addon references)
with mapping_data(provider, external_ref, product_key) as (
  values
    -- [1 EDISI] Addons
    ('lynk', '6985e90d938f72825acb607a-2478-5255947909-1770383629394', 'ut-ldr-nostalgia-masa-depan-digital'),
    ('lynk', '6985e90d938f72825acb607b-9173-5643764782-1770383629400', 'ut-ldr-pertanyaan-random-digital'),
    ('lynk', '69983fa01fbcff965c75d8e3-1999-7687502671-1771585440800', 'ut-ldr-this-or-that-digital'),
    ('lynk', '69983fa01fbcff965c75d8e4-6320-4585231426-1771585440805', 'ut-ldr-fun-challenge-digital'),
    ('lynk', '69983fa01fbcff965c75d8e5-5266-8130238397-1771585440810', 'mb-ldr-truth-or-dare-digital'),
    -- [3 EDISI] Addons
    ('lynk', '6a484096f29567321a249c61-1609-6881522543-1783120022439', 'ut-ldr-this-or-that-digital'),
    ('lynk', '6a484096f29567321a249c62-1578-2931616790-1783120022443', 'ut-ldr-fun-challenge-digital'),
    -- [6 EDISI] Addon
    ('lynk', '6a60cbc39a3e5d34ec31ea4f-3352-8077211172-1784728515424', 'ut-ldr-date-carnival-night-digital')
)
insert into public.product_external_mappings (product_id, external_ref, provider)
select p.id, m.external_ref, m.provider
from mapping_data m
join public.products p on p.product_key = m.product_key
on conflict (provider, external_ref) do nothing;

-- 5. Update transaction_items yang sebelumnya belum terhubung (product_id null)
with ref_product_map as (
  select pem.external_ref, pem.product_id, p.price
  from public.product_external_mappings pem
  join public.products p on p.id = pem.product_id
  where pem.provider = 'lynk'
)
update public.transaction_items ti
set
  product_id = m.product_id,
  unit_amount = coalesce(ti.unit_amount, m.price)
from ref_product_map m
where ti.external_product_ref = m.external_ref
  and (ti.product_id is null or ti.unit_amount is null);

-- 6. Berikan akses langsung ke member jika ada transaksi sukses terkait yang baru ter-update
do $$
declare
  _item record;
begin
  for _item in (
    select distinct ti.product_id, ti.id as item_id, m.id as member_id
    from public.transaction_items ti
    join public.transactions t on t.id = ti.transaction_id
    join public.members m on m.customer_id = t.customer_id
    where ti.product_id in (
      select id from public.products where product_key in (
        'ut-ldr-nostalgia-masa-depan-digital',
        'ut-ldr-pertanyaan-random-digital',
        'ut-ldr-this-or-that-digital',
        'ut-ldr-fun-challenge-digital',
        'mb-ldr-truth-or-dare-digital',
        'ut-ldr-date-carnival-night-digital'
      )
    )
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
