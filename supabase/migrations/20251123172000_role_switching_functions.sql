-- migration: role switching functions
-- description: ensure role switching RPCs exist and reflect active/available roles
-- created: 2025-11-23T17:20:00Z

-- clean existing functions to avoid signature conflicts on reset
drop function if exists get_available_roles();
drop function if exists switch_active_role(text);

-- returns available roles for the current user with active and primary role
create or replace function get_available_roles()
returns table (
    roles text[],
    active_role text,
    primary_role text
) security definer
set search_path = public, auth
language plpgsql
as $$
declare
    current_user_id uuid := auth.uid();
    role_list text[];
    current_active text;
    current_primary text;
begin
    if current_user_id is null then
        return query select array[]::text[], null::text, null::text;
        return;
    end if;

    select coalesce(p.user_type::text, 'locataire') into current_primary
    from profiles p
    where p.id = current_user_id;

    select array_agg(distinct ur.role::text)
    from user_roles ur
    where ur.user_id = current_user_id
    into role_list;

    -- always include the primary role
    role_list := coalesce(role_list, array[]::text[]);
    if not current_primary = any(role_list) then
        role_list := array_append(role_list, current_primary);
    end if;

    select coalesce(p.active_role, current_primary) into current_active
    from profiles p
    where p.id = current_user_id;

    return query
    select role_list, current_active, current_primary;
end;
$$;

grant execute on function get_available_roles() to authenticated;

-- switch the active role of the current user, adding the role if missing
create or replace function switch_active_role(new_role text)
returns table (
    success boolean,
    active_role text,
    roles text[]
) security definer
set search_path = public, auth
language plpgsql
as $$
declare
    current_user_id uuid := auth.uid();
    allowed text[] := array['locataire', 'proprietaire', 'agence', 'admin', 'admin_ansut'];
    role_list text[];
begin
    if current_user_id is null then
        return query select false, null::text, array[]::text[];
        return;
    end if;

    if not new_role = any(allowed) then
        return query select false, null::text, array[]::text[];
        return;
    end if;

    -- ensure the role exists in user_roles
    insert into user_roles (user_id, role)
    select current_user_id, new_role::user_role
    where not exists (
        select 1 from user_roles ur
        where ur.user_id = current_user_id
          and ur.role = new_role::user_role
    );

    -- update profile active role (and user_type for consistency)
    update profiles
    set active_role = new_role,
        user_type = new_role::user_type,
        updated_at = now()
    where id = current_user_id;

    -- rebuild role list
    select array_agg(distinct ur.role::text)
    from user_roles ur
    where ur.user_id = current_user_id
    into role_list;

    if not new_role = any(role_list) then
        role_list := array_append(coalesce(role_list, array[]::text[]), new_role);
    end if;

    return query select true, new_role, role_list;
end;
$$;

grant execute on function switch_active_role(text) to authenticated;
