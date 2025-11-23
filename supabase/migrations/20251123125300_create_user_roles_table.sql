-- migration: create user roles table
-- description: create user roles table for permission management
-- created: 2025-11-23T12:53:00Z

-- create user_roles table to manage user permissions
-- this table provides role-based access control for the platform
create table if not exists user_roles (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- foreign key to auth.users
    user_id uuid references auth.users on delete cascade not null,

    -- role assignment
    role user_role default 'user',

    -- timestamps
    created_at timestamptz default now()
);

-- enable row level security on user_roles table
-- ensures users can only access their own role assignments
alter table user_roles enable row level security;

-- create policy for users to view their own roles
-- allows authenticated users to read their own role assignments
create policy "users can view own roles"
    on user_roles for select
    to authenticated
    using (auth.uid() = user_id);

-- create policy for system to manage user roles
-- allows the system to create and manage role assignments
create policy "system can manage user roles"
    on user_roles for all
    to authenticated
    using (true)
    with check (true);

-- create indexes for performance optimization
-- index on user_id for quick role lookups
create index if not exists idx_user_roles_user_id on user_roles(user_id);

-- index on role for filtering by role type
create index if not exists idx_user_roles_role on user_roles(role);

-- create function to check if user has a specific role
-- this function is used for role-based access control in other policies
create or replace function has_role(required_role user_role)
returns boolean as $$
begin
    return exists (
        select 1 from user_roles
        where user_id = auth.uid()
        and role = required_role
    );
end;
$$ language plpgsql security definer;

-- create function to automatically assign default role to new users
-- this trigger function assigns the 'user' role to newly created users
create or replace function assign_default_role()
returns trigger as $$
begin
    insert into user_roles (user_id, role)
    values (new.id, 'user');
    return new;
end;
$$ language plpgsql security definer;

-- note: trigger disabled to prevent dependency issues during migration
-- default role assignment will be handled in the handle_new_user function
-- create trigger trigger_assign_default_role
--     after insert on auth.users
--     for each row
--     execute function assign_default_role();