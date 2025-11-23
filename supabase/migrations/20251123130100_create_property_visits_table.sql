-- migration: create property visits table
-- description: create property visits table for scheduling and managing property viewings
-- created: 2025-11-23T13:01:00Z

-- create property_visits table to manage property visit scheduling
-- this table handles visit requests and scheduling between tenants and property owners
create table if not exists property_visits (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- visit relationships
    property_id uuid references properties on delete cascade not null,
    visitor_id uuid references auth.users on delete cascade not null,
    owner_id uuid references auth.users on delete cascade not null,

    -- visit details
    visit_type visit_type not null default 'physique',
    visit_date date not null,
    visit_time time not null,
    duration_minutes integer default 60,

    -- visit status
    status visit_status default 'en_attente',

    -- visit information
    visitor_notes text,
    owner_notes text,
    feedback text,
    rating integer check (rating >= 1 and rating <= 5),

    -- status tracking
    confirmed_at timestamptz,
    cancelled_at timestamptz,
    cancelled_by uuid references auth.users on delete set null,
    cancellation_reason text,

    -- notifications
    reminder_sent boolean default false,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on property_visits table
-- controls access to visit data based on user involvement
alter table property_visits enable row level security;

-- create policy for visitors to view their own visits
-- allows authenticated users to view visits they requested
create policy "visitors can view own visits"
    on property_visits for select
    to authenticated
    using (auth.uid() = visitor_id);

-- create policy for owners to view visits for their properties
-- allows property owners to view visits for their properties
create policy "owners can view property visits"
    on property_visits for select
    to authenticated
    using (auth.uid() = owner_id);

-- create policy for visitors to create visit requests
-- allows authenticated users to request property visits
create policy "visitors can create visit requests"
    on property_visits for insert
    to authenticated
    with check (auth.uid() = visitor_id);

-- create policy for visitors to update their visits
-- allows authenticated users to modify their visit requests
create policy "visitors can update their visits"
    on property_visits for update
    to authenticated
    using (auth.uid() = visitor_id)
    with check (auth.uid() = visitor_id);

-- create policy for owners to manage visits for their properties
-- allows property owners to confirm or cancel visit requests
create policy "owners can manage property visits"
    on property_visits for update
    to authenticated
    using (auth.uid() = owner_id)
    with check (auth.uid() = owner_id);

-- create policy for users to delete their visit requests
-- allows users to cancel their own visit requests
create policy "users can delete visit requests"
    on property_visits for delete
    to authenticated
    using (auth.uid() = visitor_id or auth.uid() = owner_id);

-- create indexes for performance optimization
-- index on property_id for quick visit lookups by property
create index if not exists idx_property_visits_property_id on property_visits(property_id);

-- index on visitor_id for quick visit lookups by visitor
create index if not exists idx_property_visits_visitor_id on property_visits(visitor_id);

-- index on owner_id for quick visit lookups by owner
create index if not exists idx_property_visits_owner_id on property_visits(owner_id);

-- index on visit_date for scheduling queries
create index if not exists idx_property_visits_date on property_visits(visit_date);

-- index on status for filtering by visit status
create index if not exists idx_property_visits_status on property_visits(status);

-- composite index for owner dashboard
create index if not exists idx_property_visits_owner_dashboard on property_visits(owner_id, status, visit_date);

-- create function to check visit availability
-- this function prevents double-booking visits for the same time slot
create or replace function check_visit_availability(
    p_property_id uuid,
    p_visit_date date,
    p_visit_time time,
    p_duration_minutes integer default 60
)
returns boolean as $$
declare
    v_end_time time;
    v_conflict_count integer;
begin
    v_end_time := p_visit_time + (p_duration_minutes || ' minutes')::interval;

    select count(*) into v_conflict_count
    from property_visits
    where property_id = p_property_id
      and visit_date = p_visit_date
      and status in ('en_attente', 'confirmee')
      and (
        (visit_time <= p_visit_time and (visit_time + (duration_minutes || ' minutes')::interval) > p_visit_time)
        or
        (visit_time < v_end_time and visit_time >= p_visit_time)
      );

    return v_conflict_count = 0;
end;
$$ language plpgsql;

-- create trigger to automatically update updated_at timestamp
-- this trigger fires before any update on the property_visits table

create trigger trigger_update_property_visits_updated_at
    before update on property_visits
    for each row
    execute function update_profiles_updated_at();