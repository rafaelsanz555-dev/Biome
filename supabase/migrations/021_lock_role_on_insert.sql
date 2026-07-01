-- bio.me · Cierra la escalada de privilegios en el INSERT de profiles.
-- La migración 017 bloquea cambios de role en UPDATE, pero el INSERT quedó
-- abierto: un usuario autenticado podía crear su perfil con role='admin'
-- directamente vía la REST API de Supabase (la RLS de insert solo valida id).
-- Idempotente: seguro de correr más de una vez.

create or replace function public.prevent_profile_role_client_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.role() = 'authenticated' and coalesce(new.role, 'reader') not in ('reader', 'creator') then
        raise exception 'profiles.role must be reader or creator at signup';
    end if;
    return new;
end;
$$;

drop trigger if exists prevent_profile_role_client_insert on public.profiles;
create trigger prevent_profile_role_client_insert
before insert on public.profiles
for each row
execute function public.prevent_profile_role_client_insert();
