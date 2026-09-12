-- Arvisha catalog data: update descriptions for new Lynk products.
--
-- This migration updates the description column for 'utrt-4-anak-digital'
-- and 'utrt-2-cetak' products.

update public.products
set 
  description = 'Paket 4 edisi digital Ular Tangga Edukasi Anak yang dirancang untuk menemani aktivitas bermain dan belajar bersama anak, mencakup Mathematical Mission, Active Mission, Explorer Mission, serta Social & Emotion Mission.',
  updated_at = now()
where product_key = 'utrt-4-anak-digital';

update public.products
set 
  description = 'Paket 2 edisi cetak eksklusif Ular Tangga Rumah Tangga untuk pasutri, terdiri dari edisi Deep Talk dan Truth or Dare untuk menemani momen bermain dan membangun komunikasi bersama pasangan.',
  updated_at = now()
where product_key = 'utrt-2-cetak';
