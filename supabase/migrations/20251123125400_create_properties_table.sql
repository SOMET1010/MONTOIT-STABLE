-- migration: create properties table
-- description: create properties table for listing rental properties
-- created: 2025-11-23T12:54:00Z

-- create properties table to store rental property listings
-- this table contains all property information available for rent
create table if not exists properties (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- owner information
    owner_id uuid references auth.users on delete cascade not null,

    -- property details
    title text not null,
    description text,
    address text not null,
    city text not null,
    neighborhood text,

    -- geographical coordinates
    latitude double precision,
    longitude double precision,

    -- property categorization
    property_type property_type not null,
    status property_status default 'disponible',

    -- property specifications
    bedrooms integer default 0,
    bathrooms integer default 0,
    surface_area double precision,

    -- property features
    has_parking boolean default false,
    has_garden boolean default false,
    is_furnished boolean default false,
    has_ac boolean default false,

    -- pricing information
    monthly_rent decimal(10,2) not null,
    deposit_amount decimal(10,2),
    charges_amount decimal(10,2) default 0,

    -- media
    images text[] default '{}',
    main_image text,

    -- analytics
    view_count integer default 0,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on properties table
-- controls access to property data based on user permissions
alter table properties enable row level security;

-- create policy for anyone to view available properties
-- allows anonymous and authenticated users to view available properties
create policy "anyone can view available properties"
    on properties for select
    to anon, authenticated
    using (status = 'disponible' or owner_id = auth.uid());

-- create policy for property owners to insert their properties
-- allows authenticated users to create property listings
create policy "owners can insert own properties"
    on properties for insert
    to authenticated
    with check (auth.uid() = owner_id);

-- create policy for property owners to update their properties
-- allows authenticated users to modify their own property listings
create policy "owners can update own properties"
    on properties for update
    to authenticated
    using (auth.uid() = owner_id)
    with check (auth.uid() = owner_id);

-- create policy for property owners to delete their properties
-- allows authenticated users to delete their own property listings
create policy "owners can delete own properties"
    on properties for delete
    to authenticated
    using (auth.uid() = owner_id);

-- create indexes for performance optimization
-- index on owner_id for quick property lookups by owner
create index if not exists idx_properties_owner_id on properties(owner_id);

-- index on city for location-based searches
create index if not exists idx_properties_city on properties(city);

-- index on property_type for filtering by property category
create index if not exists idx_properties_type on properties(property_type);

-- index on status for filtering by availability
create index if not exists idx_properties_status on properties(status);

-- index on monthly_rent for price-based searches
create index if not exists idx_properties_monthly_rent on properties(monthly_rent);

-- index on created_at for sorting by listing date
create index if not exists idx_properties_created_at on properties(created_at);

-- composite index for search optimization
create index if not exists idx_properties_search on properties(city, property_type, status, monthly_rent);

-- create function to increment property view count
-- this function safely increments the view counter for analytics
create or replace function increment_property_view_count(property_id uuid)
returns void
language plpgsql
security definer
as $$
begin
    update properties
    set view_count = view_count + 1
    where id = property_id;
end;
$$;

-- grant execute permission on view count function to all users
grant execute on function increment_property_view_count(uuid) to anon, authenticated;

-- create trigger to automatically update updated_at timestamp
-- this trigger fires before any update on the properties table

create trigger trigger_update_properties_updated_at
    before update on properties
    for each row
    execute function update_profiles_updated_at();