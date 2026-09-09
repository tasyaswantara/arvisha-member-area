-- Create the application member row as part of Auth user creation.
-- The function is intentionally trigger-only and is not a client RPC.

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

  if member_full_name is null then
    raise exception 'A full_name metadata value is required to create a member';
  end if;

  insert into public.members (id, full_name)
  values (new.id, member_full_name);

  return new;
end;
$$;

comment on function public.handle_new_member() is
  'Creates the public member profile for a newly created Auth user.';

revoke execute on function public.handle_new_member() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_member();
