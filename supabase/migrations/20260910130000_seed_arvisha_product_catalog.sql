-- Arvisha catalog data sourced from the verified Phase 5E-2 catalog mapping.
-- This migration intentionally excludes customers, members, transactions,
-- product access, and Lynk addon rows.

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
    'utrt-4-digital',
    'lynk',
    '[4 EDISI] Ular Tangga Rumah Tangga (Digital) by @ceritaserupasutri',
    '69ad1001803bd1512eb3678a-5232-1296826693-1772949505954',
    true,
    null,
    '/images/UTRT.png',
    'https://lynk.id/ceritaserupasutri/01k1p3g3vjr9',
    'base'
  ),
  (
    'utrt-8-digital',
    'lynk',
    '[8 EDISI] Ular Tangga Rumah Tangga + Edukasi Anak (Digital) by @ceritaserupasutri',
    '6a0cff595363476168bae64b-1280-1332585385-1779236697466',
    true,
    null,
    '/images/UTRT-Anak.png',
    'https://lynk.id/ceritaserupasutri/e9vorplyw8l9',
    'bundle'
  ),
  (
    'utrt-family-package',
    'lynk',
    'Ular Tangga Family Package (8 Digital + 2 Cetak Eksklusif) by @ceritaserupasutri',
    '6a3b976f660df180e3402b76-2732-4527263630-1782290287002',
    true,
    null,
    '/images/UTRT-Anak-Cetak 2 pasutri.png',
    'https://lynk.id/ceritaserupasutri/mrmpl9nqd7m2',
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
    'utrt-deeptalk',
    'Ular Tangga Rumah Tangga Edisi Deeptalk',
    'digital',
    'https://view.genially.com/6a8d279d7209b13690f0f48a',
    true
  ),
  (
    'utrt-truth-or-dare',
    'Ular Tangga Rumah Tangga Edisi Truth Or Dare',
    'digital',
    'https://view.genially.com/6a8d27824d1493bad048d4ad',
    true
  ),
  (
    'utrt-fun-question',
    'Ular Tangga Rumah Tangga Edisi Fun Question',
    'digital',
    'https://view.genially.com/6a8ab00bcaa74c73293873f7',
    true
  ),
  (
    'utrt-money-talk',
    'Ular Tangga Rumah Tangga Edisi Money Talk',
    'digital',
    'https://view.genially.com/6a8d275bc719928f62e317d2',
    true
  ),
  (
    'utrt-anak-mathematical-mission',
    'Ular Tangga Anak Edisi Mathematical Mission',
    'digital',
    'https://view.genially.com/6a903a4ce71a7531504e307f',
    true
  ),
  (
    'utrt-anak-active-mission',
    'Ular Tangga Anak Edisi Active Mission',
    'digital',
    'https://view.genially.com/6a903a825c1d9ab9029cfebc',
    true
  ),
  (
    'utrt-anak-explorer-mission',
    'Ular Tangga Anak Edisi Explorer Mission',
    'digital',
    'https://view.genially.com/6a903a5b28cdcfe47bb17be4',
    true
  ),
  (
    'utrt-anak-social-emotion-mission',
    'Ular Tangga Anak Edisi Social & Emotion Mission',
    'digital',
    'https://view.genially.com/6a903a6e516ee3c9d8f510c3',
    true
  ),
  (
    'utrt-cetak-deeptalk',
    '(Cetak) Ular Tangga Rumah Tangga Edisi Deeptalk',
    'print',
    null,
    true
  ),
  (
    'utrt-cetak-truth-or-dare',
    '(Cetak) Ular Tangga Rumah Tangga Edisi Truth Or Dare',
    'print',
    null,
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
    ('utrt-4-digital', 'utrt-deeptalk'),
    ('utrt-4-digital', 'utrt-truth-or-dare'),
    ('utrt-4-digital', 'utrt-fun-question'),
    ('utrt-4-digital', 'utrt-money-talk'),
    ('utrt-8-digital', 'utrt-deeptalk'),
    ('utrt-8-digital', 'utrt-truth-or-dare'),
    ('utrt-8-digital', 'utrt-fun-question'),
    ('utrt-8-digital', 'utrt-money-talk'),
    ('utrt-8-digital', 'utrt-anak-mathematical-mission'),
    ('utrt-8-digital', 'utrt-anak-active-mission'),
    ('utrt-8-digital', 'utrt-anak-explorer-mission'),
    ('utrt-8-digital', 'utrt-anak-social-emotion-mission'),
    ('utrt-family-package', 'utrt-deeptalk'),
    ('utrt-family-package', 'utrt-truth-or-dare'),
    ('utrt-family-package', 'utrt-fun-question'),
    ('utrt-family-package', 'utrt-money-talk'),
    ('utrt-family-package', 'utrt-anak-mathematical-mission'),
    ('utrt-family-package', 'utrt-anak-active-mission'),
    ('utrt-family-package', 'utrt-anak-explorer-mission'),
    ('utrt-family-package', 'utrt-anak-social-emotion-mission'),
    ('utrt-family-package', 'utrt-cetak-deeptalk'),
    ('utrt-family-package', 'utrt-cetak-truth-or-dare')
)
insert into public.product_contents (product_id, content_id)
select p.id, c.id
from content_mapping mapping
join public.products p on p.product_key = mapping.product_key
join public.contents c on c.content_key = mapping.content_key
on conflict (product_id, content_id) do nothing;
