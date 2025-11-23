-- migration: fix missing tables and relationships
-- description: add missing columns/tables for visits, conversations, ai tracking
-- created: 2025-11-23T18:15:00Z

-- Add property_id to conversations if missing
alter table if exists conversations
add column if not exists property_id uuid references properties(id);

-- Ensure property_visits links to profiles for joins
do $$
begin
    if exists (
        select 1 from information_schema.table_constraints
        where constraint_name = 'property_visits_owner_id_fkey'
          and table_name = 'property_visits'
          and table_schema = 'public'
    ) then
        alter table property_visits
        drop constraint property_visits_owner_id_fkey;
    end if;
    alter table property_visits
    add constraint property_visits_owner_id_fkey foreign key (owner_id) references profiles(id) on delete cascade;
exception
    when duplicate_object then null;
end $$;

do $$
begin
    if exists (
        select 1 from information_schema.table_constraints
        where constraint_name = 'property_visits_visitor_id_fkey'
          and table_name = 'property_visits'
          and table_schema = 'public'
    ) then
        alter table property_visits
        drop constraint property_visits_visitor_id_fkey;
    end if;
    alter table property_visits
    add constraint property_visits_visitor_id_fkey foreign key (visitor_id) references profiles(id) on delete cascade;
exception
    when duplicate_object then null;
end $$;

-- ai_recommendations table (minimal schema)
create table if not exists ai_recommendations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    property_id uuid not null references properties(id) on delete cascade,
    recommendation_score numeric default 0,
    recommendation_reason text,
    algorithm_type text,
    clicked boolean default false,
    clicked_at timestamptz,
    created_at timestamptz default now()
);
create index if not exists idx_ai_reco_user on ai_recommendations(user_id);
create index if not exists idx_ai_reco_property on ai_recommendations(property_id);

-- ai_usage_logs table (minimal schema)
create table if not exists ai_usage_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    action text,
    metadata jsonb,
    created_at timestamptz default now()
);
create index if not exists idx_ai_usage_user on ai_usage_logs(user_id);

-- user_activity_tracking table (minimal schema)
create table if not exists user_activity_tracking (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    activity_type text,
    context jsonb,
    created_at timestamptz default now()
);
create index if not exists idx_user_activity_user on user_activity_tracking(user_id);
