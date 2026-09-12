-- Arvisha catalog data: add two standalone Lynk products.
--
-- This migration adds two new catalog products and maps them
-- to existing reusable content units.
--
-- No existing products or contents are modified.

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
    'utrt-4-anak-digital',
    'lynk',
    '[4 EDISI] Ular Tangga Edukasi Anak (Digital) by @ceritaserupasutri',
    '69fc479e76e56b7ebe58804b-7275-7708844861-1778141086400',
    true,
    null,
    '/images/UT Anak.png',
    'https://lynk.id/ceritaserupasutri/yo8rzvvl81gq',
    'base'
  ),
  (
    'utrt-2-cetak',
    'lynk',
    '[2 Cetak Eksklusif] Ular Tangga Rumah Tangga by @ceritaserupasutri',
    '6aa4db254885255955d84800-3379-7467234574-1789188901446',
    true,
    null,
    '/images/UTRT CETAK 2 EDISI.png',
    'https://lynk.id/ceritaserupasutri/oemypk113y95',
    'base'
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


with content_mapping(product_key, content_key) as (
  values
    (
      'utrt-4-anak-digital',
      'utrt-anak-mathematical-mission'
    ),
    (
      'utrt-4-anak-digital',
      'utrt-anak-active-mission'
    ),
    (
      'utrt-4-anak-digital',
      'utrt-anak-explorer-mission'
    ),
    (
      'utrt-4-anak-digital',
      'utrt-anak-social-emotion-mission'
    ),
    (
      'utrt-2-cetak',
      'utrt-cetak-deeptalk'
    ),
    (
      'utrt-2-cetak',
      'utrt-cetak-truth-or-dare'
    )
)
insert into public.product_contents (product_id, content_id)
select
  p.id,
  c.id
from content_mapping mapping
join public.products p
  on p.product_key = mapping.product_key
join public.contents c
  on c.content_key = mapping.content_key
on conflict (product_id, content_id) do nothing;