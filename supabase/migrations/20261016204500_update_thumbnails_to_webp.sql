-- Update all product thumbnail_urls to use optimized .webp assets
update public.products
set 
  thumbnail_url = replace(thumbnail_url, '.png', '.webp'),
  updated_at = now()
where thumbnail_url like '%.png';
