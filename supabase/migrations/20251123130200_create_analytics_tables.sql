-- migration: create analytics tables
-- description: create tables for tracking property analytics and user interactions
-- created: 2025-11-23T13:02:00Z

-- create property_views table to track detailed property viewing analytics
-- this table stores granular data about how users interact with property listings
create table if not exists property_views (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- view relationships
    property_id uuid references properties on delete cascade not null,
    user_id uuid references profiles on delete set null,

    -- session tracking for anonymous users
    session_id text,

    -- view details
    viewed_at timestamptz default now() not null,
    duration_seconds integer,
    source text check (source in ('search', 'map', 'favorites', 'direct', 'home', 'recommendation')),
    device_type text check (device_type in ('desktop', 'mobile', 'tablet')),

    -- timestamps
    created_at timestamptz default now()
);

-- enable row level security on property_views table
-- controls access to view analytics based on property ownership
alter table property_views enable row level security;

-- create policy for property owners to view their properties' analytics
-- allows property owners to see analytics for their properties
create policy "owners can view their properties' views"
    on property_views for select
    to authenticated
    using (
        exists (
            select 1 from properties
            where properties.id = property_views.property_id
            and properties.owner_id = auth.uid()
        )
    );

-- create policy for users to view their own view history
-- allows authenticated users to see their own viewing history
create policy "users can view own view history"
    on property_views for select
    to authenticated
    using (auth.uid() = user_id);

-- create policy for anyone to insert view data
-- allows anonymous and authenticated users to create view records
create policy "anyone can track property views"
    on property_views for insert
    to anon, authenticated
    with check (true);

-- create property_statistics table for aggregated daily metrics
-- this table stores daily aggregated statistics for each property
create table if not exists property_statistics (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- relationships
    property_id uuid references properties on delete cascade not null,
    date date not null,

    -- daily metrics
    total_views integer default 0,
    unique_views integer default 0,
    favorites_added integer default 0,
    visit_requests integer default 0,
    applications integer default 0,
    avg_duration_seconds integer default 0,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    -- ensure one record per property per day
    unique(property_id, date)
);

-- enable row level security on property_statistics table
-- controls access to statistics based on property ownership
alter table property_statistics enable row level security;

-- create policy for property owners to view their properties' statistics
-- allows property owners to see analytics for their properties
create policy "owners can view their properties' statistics"
    on property_statistics for select
    to authenticated
    using (
        exists (
            select 1 from properties
            where properties.id = property_statistics.property_id
            and properties.owner_id = auth.uid()
        )
    );

-- create policy for system to manage statistics
-- allows the system to create and update statistical records
create policy "system can manage statistics"
    on property_statistics for all
    to authenticated
    using (true)
    with check (true);

-- create indexes for property_views table
-- index on property_id for quick lookups by property
create index if not exists idx_property_views_property_id on property_views(property_id);

-- index on user_id for quick lookups by user
create index if not exists idx_property_views_user_id on property_views(user_id);

-- index on viewed_at for time-based queries
create index if not exists idx_property_views_viewed_at on property_views(viewed_at);

-- index on source for analytics by traffic source
create index if not exists idx_property_views_source on property_views(source);

-- note: composite index for daily statistics aggregation removed due to date() function not being IMMUTABLE
-- this index can be created manually after data is populated if needed
-- create index if not exists idx_property_views_daily_agg on property_views(property_id, date(viewed_at));

-- create indexes for property_statistics table
-- index on property_id for quick lookups by property
create index if not exists idx_property_statistics_property_id on property_statistics(property_id);

-- index on date for time-based queries
create index if not exists idx_property_statistics_date on property_statistics(date);

-- composite index for property analytics queries
create index if not exists idx_property_statistics_property_date on property_statistics(property_id, date);

-- create function to aggregate daily property statistics
-- this function processes raw view data and creates daily summaries
create or replace function aggregate_daily_property_statistics(p_date date default current_date - interval '1 day')
returns void
language plpgsql
security definer
as $$
begin
    insert into property_statistics (
        property_id,
        date,
        total_views,
        unique_views,
        favorites_added,
        visit_requests,
        applications,
        avg_duration_seconds
    )
    select
        pv.property_id,
        p_date,
        count(*) as total_views,
        count(distinct coalesce(pv.user_id::text, pv.session_id)) as unique_views,
        coalesce((
            select count(*) from rental_applications ra
            where ra.property_id = pv.property_id
            and date(ra.created_at) = p_date
        ), 0) as applications,
        coalesce((
            select count(*) from property_visits v
            where v.property_id = pv.property_id
            and v.visit_date = p_date
        ), 0) as visit_requests,
        coalesce(avg(pv.duration_seconds)::integer, 0) as avg_duration_seconds,
        0 as favorites_added -- will be updated separately
    from property_views pv
    where date(pv.viewed_at) = p_date
    group by pv.property_id
    on conflict (property_id, date)
    do update set
        total_views = excluded.total_views,
        unique_views = excluded.unique_views,
        applications = excluded.applications,
        visit_requests = excluded.visit_requests,
        avg_duration_seconds = excluded.avg_duration_seconds,
        updated_at = now();
end;
$$;

-- create function to get property conversion rate
-- this function calculates the conversion rate from views to applications
create or replace function get_property_conversion_rate(p_property_id uuid, p_days integer default 30)
returns numeric
language plpgsql
security definer
as $$
declare
    v_views integer;
    v_applications integer;
    v_rate numeric;
begin
    select
        coalesce(sum(total_views), 0),
        coalesce(sum(applications), 0)
    into v_views, v_applications
    from property_statistics
    where property_id = p_property_id
    and date >= current_date - p_days;

    if v_views > 0 then
        v_rate := (v_applications::numeric / v_views::numeric) * 100;
    else
        v_rate := 0;
    end if;

    return round(v_rate, 2);
end;
$$;

-- create trigger to automatically update updated_at timestamp for property_statistics
-- this trigger fires before any update on the property_statistics table

create trigger trigger_update_property_statistics_updated_at
    before update on property_statistics
    for each row
    execute function update_profiles_updated_at();