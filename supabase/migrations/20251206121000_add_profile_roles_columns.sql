-- migration: add profile roles columns
-- description: add available_roles and active_role columns to profiles table
-- created: 2025-12-06T12:10:00Z

-- add active_role column to profiles table
do $$
begin
    alter table profiles add column if not exists active_role text default 'locataire';
exception
    when duplicate_column then null;
end $$;

-- add available_roles column to profiles table (as jsonb array)
do $$
begin
    alter table profiles add column if not exists available_roles jsonb default '[]'::jsonb;
exception
    when duplicate_column then null;
end $$;

-- update existing profiles to set active_role from user_type if not already set
update profiles
set active_role = coalesce(active_role, user_type::text)
where active_role is null or active_role = '';

-- update existing profiles to set available_roles if empty
update profiles
set available_roles =
    case
        when available_roles = '[]'::jsonb then
            to_jsonb(array[user_type::text])
        else
            available_roles
    end
where available_roles = '[]'::jsonb;

-- create index on active_role for faster queries
create index if not exists idx_profiles_active_role on profiles(active_role);

-- create index on available_roles for faster queries
create index if not exists idx_profiles_available_roles on profiles using gin(available_roles);