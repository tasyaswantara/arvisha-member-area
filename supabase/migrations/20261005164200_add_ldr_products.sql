insert into public.products (
  product_key,
  provider,
  name,
  external_product_ref,
  is_active,
  price,
  thumbnail_url,
  purchase_url,
  product_type
)
values
  (
    'ut-ldr-1-digital',
    'lynk',
    '[1 EDISI] Ular Tangga LDR Edisi Truth or Dare by @ceritapejuangldr',
    '68c69882edfb0659198ed9af-7455-5924845327-1757845634339',
    true,
    null,
    '/images/LDR Edisi TOD.png',
    'https://lynk.id/arvisha/wjozkojl7xvp',
    'base'
  ),
  (
    'ut-ldr-3-digital',
    'lynk',
    '[3 EDISI] LDR TRIPLE PACK by @ceritapejuangldr',
    '68e0a7085d76f2bc3e410273-8740-5434909512-1759553288858',
    true,
    null,
    '/images/LDR Triple Pack.png',
    'https://lynk.id/arvisha/jle35d8950ww',
    'bundle'
  ),
  (
    'ut-ldr-6-digital',
    'lynk',
    '[6 EDISI] LDR COMPLETE PACK by @ceritapejuangldr',
    '696c830446c60fe682daa764-5321-5050899032-1768719108717',
    true,
    null,
    '/images/LDR Complete Pack.png',
    'https://lynk.id/arvisha/ly9m66m49r0k',
    'bundle'
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
  updated_at = now();

insert into public.contents (
  content_key,
  name,
  content_type,
  embed_url,
  is_active
)
values
  (
    'ut-ldr-truth-or-dare',
    'Ular Tangga LDR Edisi Truth or Dare',
    'digital',
    'https://view.genially.com/6aa4e029437b55843b025448',
    true
  ),
  (
    'ut-ldr-pertanyaan-random',
    'Ular Tangga LDR Edisi Pertanyaan Random',
    'digital',
    'https://view.genially.com/6aa4e0001b44580d49aec24d',
    true
  ),
  (
    'ut-ldr-nostalgia-masa-depan',
    'Ular Tangga LDR Edisi Nostalgia dan Masa Depan',
    'digital',
    'https://view.genially.com/6aa4e0189bb09a2bb7c61b8a',
    true
  ),
  (
    'ut-ldr-this-or-that',
    'Ular Tangga LDR Edisi This or That',
    'digital',
    'https://view.genially.com/6aa659959bb09a2bb704c968',
    true
  ),
  (
    'ut-ldr-fun-challenge',
    'Ular Tangga LDR Edisi Fun Challenge',
    'digital',
    'https://view.genially.com/6aa659b23423818e83b16376',
    true
  ),
  (
    'mb-ldr-truth-or-dare',
    'Mystery Box Edisi Truth or Dare',
    'digital',
    'https://view.genially.com/6aa7c3e4ee0678d6333afdac',
    true
  )
on conflict (content_key) do update
set
  name = excluded.name,
  content_type = excluded.content_type,
  embed_url = excluded.embed_url,
  is_active = excluded.is_active,
  updated_at = now();

with content_mapping(product_key, content_key) as (
  values
    ('ut-ldr-1-digital', 'ut-ldr-truth-or-dare'),
    ('ut-ldr-3-digital', 'ut-ldr-pertanyaan-random'),
    ('ut-ldr-3-digital', 'ut-ldr-nostalgia-masa-depan'),
    ('ut-ldr-3-digital', 'ut-ldr-truth-or-dare'),
    ('ut-ldr-6-digital', 'ut-ldr-pertanyaan-random'),
    ('ut-ldr-6-digital', 'ut-ldr-nostalgia-masa-depan'),
    ('ut-ldr-6-digital', 'ut-ldr-truth-or-dare'),
    ('ut-ldr-6-digital', 'ut-ldr-this-or-that'),
    ('ut-ldr-6-digital', 'ut-ldr-fun-challenge'),
    ('ut-ldr-6-digital', 'mb-ldr-truth-or-dare')
)
insert into public.product_contents (product_id, content_id)
select p.id, c.id
from content_mapping mapping
join public.products p on p.product_key = mapping.product_key
join public.contents c on c.content_key = mapping.content_key
on conflict (product_id, content_id) do nothing;
