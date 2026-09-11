-- Relax the strict full_name requirement for member creation.
-- This ensures users created via OAuth or manual admin creation without full_name
-- metadata do not fail. It safely falls back to their email prefix or 'Member'.

create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_full_name text;
begin
  member_full_name := nullif(
    pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')),
    ''
  );

  -- Safe fallback if full_name is entirely absent
  if member_full_name is null then
    member_full_name := coalesce(
      nullif(pg_catalog.btrim(pg_catalog.split_part(new.email, '@', 1)), ''),
      'Member'
    );
  end if;

  insert into public.members (id, full_name)
  values (new.id, member_full_name);

  return new;
end;
$$;
