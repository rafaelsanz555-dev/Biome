-- Lock profile roles so client-side authenticated users cannot self-promote.
-- Role changes must go through service-role admin actions.

create or replace function public.prevent_profile_role_client_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.role() = 'authenticated' and new.role is distinct from old.role then
        raise exception 'profiles.role can only be changed by trusted server code';
    end if;
    return new;
end;
$$;

drop trigger if exists prevent_profile_role_client_update on public.profiles;
create trigger prevent_profile_role_client_update
before update on public.profiles
for each row
execute function public.prevent_profile_role_client_update();

drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users update own profile." on public.profiles;
drop policy if exists "profiles_update_own_safe" on public.profiles;

create policy "profiles_update_own_safe"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
