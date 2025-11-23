-- migration: create favorites and alerts system
-- description: create tables for property favorites and user notification alerts
-- created: 2025-11-23T13:03:00Z

-- create property_favorites table for user saved properties
-- this table allows users to save properties they are interested in
create table if not exists property_favorites (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- relationships
    user_id uuid references auth.users on delete cascade not null,
    property_id uuid references properties on delete cascade not null,

    -- user notes
    notes text,

    -- timestamps
    created_at timestamptz default now(),

    -- ensure one favorite per user per property
    unique(user_id, property_id)
);

-- enable row level security on property_favorites table
-- ensures users can only manage their own favorites
alter table property_favorites enable row level security;

-- create policy for users to view their own favorites
-- allows authenticated users to see their saved properties
create policy "users can view their own favorites"
    on property_favorites for select
    to authenticated
    using (auth.uid() = user_id);

-- create policy for users to add favorites
-- allows authenticated users to save properties to their favorites
create policy "users can add favorites"
    on property_favorites for insert
    to authenticated
    with check (auth.uid() = user_id);

-- create policy for users to remove their favorites
-- allows authenticated users to remove properties from their favorites
create policy "users can remove their favorites"
    on property_favorites for delete
    to authenticated
    using (auth.uid() = user_id);

-- create policy for users to update their favorite notes
-- allows authenticated users to modify notes on their saved properties
create policy "users can update their favorite notes"
    on property_favorites for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create saved_searches table for user custom search alerts
-- this table stores user-defined search criteria for automatic notifications
create table if not exists saved_searches (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- relationships
    user_id uuid references auth.users on delete cascade not null,

    -- search details
    name text not null,
    search_criteria jsonb not null default '{}'::jsonb,

    -- alert settings
    alert_enabled boolean default false,
    alert_frequency alert_frequency default 'immediate',
    last_notified_at timestamptz,
    is_active boolean default true,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on saved_searches table
-- ensures users can only manage their own saved searches
alter table saved_searches enable row level security;

-- create policy for users to view their saved searches
-- allows authenticated users to see their saved search criteria
create policy "users can view their saved searches"
    on saved_searches for select
    to authenticated
    using (auth.uid() = user_id);

-- create policy for users to create saved searches
-- allows authenticated users to save custom search criteria
create policy "users can create saved searches"
    on saved_searches for insert
    to authenticated
    with check (auth.uid() = user_id);

-- create policy for users to update their saved searches
-- allows authenticated users to modify their saved search criteria
create policy "users can update their saved searches"
    on saved_searches for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create policy for users to delete their saved searches
-- allows authenticated users to remove their saved search criteria
create policy "users can delete their saved searches"
    on saved_searches for delete
    to authenticated
    using (auth.uid() = user_id);

-- create property_alerts table for individual notification records
-- this table stores individual alert notifications for users
create table if not exists property_alerts (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- relationships
    user_id uuid references auth.users on delete cascade not null,
    saved_search_id uuid references saved_searches on delete cascade,
    property_id uuid references properties on delete cascade not null,

    -- alert details
    alert_type alert_type not null,
    is_read boolean default false,
    is_dismissed boolean default false,

    -- timestamps
    created_at timestamptz default now()
);

-- enable row level security on property_alerts table
-- ensures users can only manage their own alerts
alter table property_alerts enable row level security;

-- create policy for users to view their alerts
-- allows authenticated users to see their notification alerts
create policy "users can view their alerts"
    on property_alerts for select
    to authenticated
    using (auth.uid() = user_id);

-- create policy for users to update their alerts
-- allows authenticated users to mark alerts as read or dismissed
create policy "users can update their alerts"
    on property_alerts for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create policy for users to delete their alerts
-- allows authenticated users to remove their notification alerts
create policy "users can delete their alerts"
    on property_alerts for delete
    to authenticated
    using (auth.uid() = user_id);

-- create policy for system to create alerts
-- allows the system to generate automatic alerts for users
create policy "system can create alerts"
    on property_alerts for insert
    to authenticated
    with check (true);

-- create indexes for property_favorites table
-- index on user_id for quick lookups by user
create index if not exists idx_property_favorites_user_id on property_favorites(user_id);

-- index on property_id for quick lookups by property
create index if not exists idx_property_favorites_property_id on property_favorites(property_id);

-- index on created_at for sorting by favorite date
create index if not exists idx_property_favorites_created_at on property_favorites(created_at desc);

-- create indexes for saved_searches table
-- index on user_id for quick lookups by user
create index if not exists idx_saved_searches_user_id on saved_searches(user_id);

-- index on active searches for alert processing
create index if not exists idx_saved_searches_active on saved_searches(user_id, is_active) where is_active = true;

-- index on searches with alerts enabled
create index if not exists idx_saved_searches_alerts on saved_searches(user_id, alert_enabled) where alert_enabled = true;

-- create indexes for property_alerts table
-- index on user_id for quick lookups by user
create index if not exists idx_property_alerts_user_id on property_alerts(user_id);

-- index on unread alerts for notification processing
create index if not exists idx_property_alerts_unread on property_alerts(user_id, is_read) where is_read = false;

-- index on saved_search_id for relationship tracking
create index if not exists idx_property_alerts_saved_search on property_alerts(saved_search_id);

-- index on property_id for property-based alerts
create index if not exists idx_property_alerts_property_id on property_alerts(property_id);

-- create function to check if property matches search criteria
-- this function determines if a property should trigger an alert for a saved search
create or replace function property_matches_search_criteria(
    p_property_data jsonb,
    p_search_criteria jsonb
)
returns boolean as $$
declare
    matches boolean := true;
begin
    -- check city filter
    if p_search_criteria ? 'city' and p_search_criteria->>'city' != '' then
        if p_property_data->>'city' != p_search_criteria->>'city' then
            return false;
        end if;
    end if;

    -- check property type filter
    if p_search_criteria ? 'property_type' and p_search_criteria->>'property_type' != '' then
        if p_property_data->>'property_type' != p_search_criteria->>'property_type' then
            return false;
        end if;
    end if;

    -- check minimum price filter
    if p_search_criteria ? 'min_price' and p_search_criteria->>'min_price' != '' then
        if (p_property_data->>'monthly_rent')::numeric < (p_search_criteria->>'min_price')::numeric then
            return false;
        end if;
    end if;

    -- check maximum price filter
    if p_search_criteria ? 'max_price' and p_search_criteria->>'max_price' != '' then
        if (p_property_data->>'monthly_rent')::numeric > (p_search_criteria->>'max_price')::numeric then
            return false;
        end if;
    end if;

    -- check bedrooms filter
    if p_search_criteria ? 'bedrooms' and p_search_criteria->>'bedrooms' != '' then
        if (p_property_data->>'bedrooms')::integer < (p_search_criteria->>'bedrooms')::integer then
            return false;
        end if;
    end if;

    return true;
end;
$$ language plpgsql;

-- create function to automatically create alerts for new properties
-- this function generates alerts when new properties match saved search criteria
create or replace function create_alerts_for_new_property()
returns trigger as $$
declare
    search_record record;
    property_data jsonb;
begin
    -- only process if property is available
    if new.status != 'disponible' then
        return new;
    end if;

    -- convert property to jsonb for matching
    property_data := jsonb_build_object(
        'city', new.city,
        'property_type', new.property_type,
        'monthly_rent', new.monthly_rent,
        'bedrooms', new.bedrooms
    );

    -- find all active saved searches with alerts enabled
    for search_record in
        select id, user_id, search_criteria
        from saved_searches
        where is_active = true
        and alert_enabled = true
    loop
        -- check if property matches the search criteria
        if property_matches_search_criteria(property_data, search_record.search_criteria) then
            -- create alert for the user
            insert into property_alerts (user_id, saved_search_id, property_id, alert_type)
            values (search_record.user_id, search_record.id, new.id, 'new_property')
            on conflict do nothing;
        end if;
    end loop;

    return new;
end;
$$ language plpgsql;

-- create trigger to automatically create alerts when new properties are added
-- this trigger fires after any insert on the properties table

create trigger trigger_create_alerts_for_new_property
    after insert on properties
    for each row
    execute function create_alerts_for_new_property();

-- create trigger to automatically update updated_at timestamp for saved_searches
-- this trigger fires before any update on the saved_searches table

create trigger trigger_update_saved_searches_updated_at
    before update on saved_searches
    for each row
    execute function update_profiles_updated_at();