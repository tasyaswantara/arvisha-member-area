-- Arvisha catalog data: migrate old product descriptions to database
--
-- This migration updates the description column for 'utrt-4-digital',
-- 'utrt-8-digital', and 'utrt-family-package' products.

update public.products
set 
  description = '4 edisi digital Ular Tangga Rumah Tangga untuk menemani permainan dan obrolan seru bersama pasangan.',
  updated_at = now()
where product_key = 'utrt-4-digital';

update public.products
set 
  description = '8 edisi digital Ular Tangga Rumah Tangga dan Edukasi Anak untuk aktivitas seru bersama pasangan dan keluarga.',
  updated_at = now()
where product_key = 'utrt-8-digital';

update public.products
set 
  description = 'Paket lengkap berisi 8 edisi digital dan 2 edisi cetak eksklusif Ular Tangga Rumah Tangga.',
  updated_at = now()
where product_key = 'utrt-family-package';
