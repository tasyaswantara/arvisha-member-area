-- 1. Tambahkan mapping untuk UUID Lynkid baru ke produk ut-ldr-6-digital
with product_data as (
  select id from public.products where product_key = 'ut-ldr-6-digital' limit 1
)
insert into public.product_external_mappings (product_id, external_ref, provider)
select id, '6aae294d5c7420860d8a0e63-8403-2530072902-1789798733376', 'lynk'
from product_data
on conflict (provider, external_ref) do nothing;

-- 2. Update transaction_items yang sebelumnya gagal terhubung (product_id null)
update public.transaction_items
set product_id = (select id from public.products where product_key = 'ut-ldr-6-digital' limit 1)
where external_product_ref = '6aae294d5c7420860d8a0e63-8403-2530072902-1789798733376'
  and product_id is null;

-- 3. Berikan akses langsung ke member yang transaksinya sudah terupdate di atas
do $$
declare
  _member_id uuid;
  _product_id uuid;
  _source_item_id uuid;
  _item record;
begin
  -- Dapatkan id produk
  select id into _product_id from public.products where product_key = 'ut-ldr-6-digital' limit 1;

  if _product_id is not null then
    for _item in (
      select ti.id as item_id, m.id as member_id
      from public.transaction_items ti
      join public.transactions t on t.id = ti.transaction_id
      join public.members m on m.customer_id = t.customer_id
      where ti.external_product_ref = '6aae294d5c7420860d8a0e63-8403-2530072902-1789798733376'
        and ti.product_id = _product_id
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
        _product_id,
        'active',
        now(),
        _item.item_id,
        now()
      )
      on conflict (member_id, product_id) do update
      set last_evaluated_at = now();

    end loop;
  end if;
end $$;
