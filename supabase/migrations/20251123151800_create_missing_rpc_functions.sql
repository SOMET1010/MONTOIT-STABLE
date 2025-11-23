-- migration: create_missing_rpc_functions
-- description: create missing RPC functions for the application
-- created: 2025-11-23T15:18:00Z

-- create get_available_roles function for user role management
-- this function returns available roles for user selection
create or replace function get_available_roles()
returns table (
    role text,
    description text,
    icon text,
    is_default boolean
) as $$
    select *
    from (values
        ('locataire', 'Trouver mon logement idéal', '🏠', false),
        ('proprietaire', 'Mettre en location mes biens', '🏢', true)
    ) as roles (role, description, icon, is_default);
$$ language sql security definer;

-- grant execute permission to authenticated users
grant execute on function get_available_roles() to authenticated;

-- create function to get user role assignments
create or replace function get_user_roles(user_id_param uuid)
returns table (
    role text,
    assigned_at timestamptz
) as $$
    select ur.role, ur.created_at as assigned_at
    from user_roles ur
    where ur.user_id = user_id_param;
$$ language sql security definer;

-- grant execute permission to authenticated users
grant execute on function get_user_roles(user_id uuid) to authenticated;

-- create function to update user role
create or replace function update_user_role(user_id_param uuid, new_role_param user_role)
returns boolean as $$
declare
    update_result int;
begin
    update user_roles
    set role = new_role_param,
        created_at = now()
    where user_id = user_id_param
    returning 1 into update_result;

    if update_result = 1 then
        return true;
    else
        -- Insert if no existing role
        insert into user_roles (user_id, role)
        values (user_id_param, new_role_param);
        return true;
    end if;
end;
$$ language plpgsql security definer;

-- grant execute permission to authenticated users
grant execute on function update_user_role(user_id uuid, new_role_param user_role) to authenticated;

-- create function to get user complete profile with verifications
create or replace function get_user_profile_complete(user_id_param uuid)
returns table (
    id uuid,
    full_name text,
    user_type text,
    email text,
    phone text,
    city text,
    bio text,
    is_verified boolean,
    oneci_verified boolean,
    cnam_verified boolean,
    face_verified boolean,
    ansut_certified boolean,
    tenant_score integer,
    role text
) as $$
    select
        p.id,
        p.full_name,
        p.user_type,
        u.email,
        p.phone,
        p.city,
        p.bio,
        p.is_verified,
        p.oneci_verified,
        p.cnam_verified,
        p.face_verified,
        p.ansut_certified,
        coalesce(uv.tenant_score, 0) as tenant_score,
        coalesce(ur.role, 'user') as role
    from profiles p
    left join auth.users u on u.id = p.id
    left join user_verifications uv on uv.user_id = p.id
    left join user_roles ur on ur.user_id = p.id
    where p.id = user_id_param;
$$ language sql security definer;

-- grant execute permission to authenticated users
grant execute on function get_user_profile_complete(user_id uuid) to authenticated;

-- add missing columns to profiles table
alter table profiles
add column if not exists profile_setup_completed boolean default false,
add column if not exists active_role text default 'locataire';

-- create conversations table for messaging system
create table if not exists conversations (
    id uuid primary key default gen_random_uuid(),
    participant_1_id uuid not null references auth.users(id) on delete cascade,
    participant_2_id uuid not null references auth.users(id) on delete cascade,
    last_message_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    -- ensure unique conversations between same participants
    unique (participant_1_id, participant_2_id)
);

-- create indexes for conversations table
create index if not exists idx_conversations_participant_1 on conversations(participant_1_id);
create index if not exists idx_conversations_participant_2 on conversations(participant_2_id);
create index if not exists idx_conversations_last_message_at on conversations(last_message_at desc);

-- enable row level security
alter table conversations enable row level security;

-- create policies for conversations
create policy "users can view conversations they participate in"
    on conversations for select
    to authenticated
    using (participant_1_id = auth.uid() or participant_2_id = auth.uid());

create policy "users can insert conversations they participate in"
    on conversations for insert
    to authenticated
    with check (participant_1_id = auth.uid() or participant_2_id = auth.uid());

create policy "users can update conversations they participate in"
    on conversations for update
    to authenticated
    using (participant_1_id = auth.uid() or participant_2_id = auth.uid())
    with check (participant_1_id = auth.uid() or participant_2_id = auth.uid());

-- add conversation_id to messages table to link with conversations
alter table messages
add column if not exists conversation_id uuid references conversations(id) on delete cascade;

-- create index for conversation_id in messages table
create index if not exists idx_messages_conversation_id on messages(conversation_id);