-- migration: create maintenance system
-- description: create tables for property maintenance requests and artisan management
-- created: 2025-11-23T13:04:00Z

-- create maintenance_requests table for tenant repair requests
-- this table manages maintenance and repair requests from tenants
create table if not exists maintenance_requests (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- relationships
    tenant_id uuid references profiles on delete cascade not null,
    property_id uuid references properties on delete cascade not null,
    lease_id uuid references leases on delete set null,

    -- request details
    issue_type text not null check (issue_type in ('plumbing', 'electrical', 'heating', 'appliance', 'structural', 'other')),
    urgency text not null check (urgency in ('low', 'medium', 'high', 'urgent')),
    description text not null,
    status text default 'en_attente' check (status in ('en_attente', 'acceptee', 'en_cours', 'planifiee', 'resolue', 'refusee')),

    -- media and documentation
    images text[] default array[]::text[],

    -- scheduling
    scheduled_date date,
    resolved_at timestamptz,
    rejection_reason text,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on maintenance_requests table
-- controls access to maintenance data based on user roles
alter table maintenance_requests enable row level security;

-- create policy for tenants to view their own maintenance requests
-- allows authenticated users to view maintenance requests they submitted
create policy "tenants can view their own maintenance requests"
    on maintenance_requests for select
    to authenticated
    using (auth.uid() = tenant_id);

-- create policy for tenants to create maintenance requests
-- allows authenticated users to submit new maintenance requests
create policy "tenants can create maintenance requests"
    on maintenance_requests for insert
    to authenticated
    with check (auth.uid() = tenant_id);

-- create policy for tenants to update their own requests
-- allows authenticated users to modify their maintenance requests
create policy "tenants can update their requests"
    on maintenance_requests for update
    to authenticated
    using (auth.uid() = tenant_id)
    with check (auth.uid() = tenant_id);

-- create policy for property owners to view requests for their properties
-- allows property owners to view maintenance requests for their properties
create policy "owners can view property maintenance requests"
    on maintenance_requests for select
    to authenticated
    using (
        exists (
            select 1 from properties
            where properties.id = maintenance_requests.property_id
            and properties.owner_id = auth.uid()
        )
    );

-- create policy for property owners to manage maintenance requests
-- allows property owners to update maintenance requests for their properties
create policy "owners can manage maintenance requests"
    on maintenance_requests for update
    to authenticated
    using (
        exists (
            select 1 from properties
            where properties.id = maintenance_requests.property_id
            and properties.owner_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from properties
            where properties.id = maintenance_requests.property_id
            and properties.owner_id = auth.uid()
        )
    );

-- create artisans table for service providers
-- this table manages artisans and maintenance service providers
create table if not exists artisans (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- relationships
    user_id uuid references auth.users on delete cascade not null,

    -- professional information
    business_name text not null,
    specializations text[] not null,
    description text,
    years_experience integer default 0,

    -- contact information
    phone text not null,
    email text not null,
    address text,
    city text,

    -- business details
    license_number text,
    insured boolean default false,
    service_area text[],

    -- ratings and verification
    average_rating decimal(3,2) default 0.00,
    total_jobs integer default 0,
    verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),

    -- pricing
    hourly_rate decimal(10,2),
    service_call_fee decimal(10,2) default 0,

    -- availability
    available boolean default true,
    response_time_hours integer default 24,

    -- media
    portfolio_images text[] default array[]::text[],
    logo_url text,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on artisans table
-- controls access to artisan information
alter table artisans enable row level security;

-- create policy for anyone to view verified artisans
-- allows public access to verified artisan profiles
create policy "anyone can view verified artisans"
    on artisans for select
    to anon, authenticated
    using (verification_status = 'verified' and available = true);

-- create policy for artisans to view their own profile
-- allows authenticated artisans to view their own profile
create policy "artisans can view their own profile"
    on artisans for select
    to authenticated
    using (auth.uid() = user_id);

-- create policy for artisans to manage their own profile
-- allows authenticated artisans to update their own profile
create policy "artisans can manage their own profile"
    on artisans for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create policy for system to manage artisan verification
-- allows admin users to manage artisan verification status
create policy "system can manage artisan verification"
    on artisans for update
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.user_type = 'admin_ansut'
        )
    );

-- create artisan_reviews table for customer feedback
-- this table stores reviews and ratings for artisans
create table if not exists artisan_reviews (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- relationships
    artisan_id uuid references artisans on delete cascade not null,
    reviewer_id uuid references auth.users on delete cascade not null,
    maintenance_request_id uuid references maintenance_requests on delete set null,

    -- review details
    rating integer not null check (rating >= 1 and rating <= 5),
    title text,
    comment text,
    would_hire_again boolean,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    -- ensure one review per maintenance request
    unique(maintenance_request_id)
);

-- enable row level security on artisan_reviews table
-- controls access to review data
alter table artisan_reviews enable row level security;

-- create policy for anyone to view artisan reviews
-- allows public access to artisan reviews
create policy "anyone can view artisan reviews"
    on artisan_reviews for select
    to anon, authenticated
    using (true);

-- create policy for users to create reviews
-- allows authenticated users to write reviews for artisans they worked with
create policy "users can create reviews"
    on artisan_reviews for insert
    to authenticated
    with check (auth.uid() = reviewer_id);

-- create policy for users to update their own reviews
-- allows authenticated users to modify their own reviews
create policy "users can update their own reviews"
    on artisan_reviews for update
    to authenticated
    using (auth.uid() = reviewer_id)
    with check (auth.uid() = reviewer_id);

-- create indexes for maintenance_requests table
-- index on tenant_id for quick lookups by tenant
create index if not exists idx_maintenance_requests_tenant_id on maintenance_requests(tenant_id);

-- index on property_id for quick lookups by property
create index if not exists idx_maintenance_requests_property_id on maintenance_requests(property_id);

-- index on status for filtering by request status
create index if not exists idx_maintenance_requests_status on maintenance_requests(status);

-- index on urgency for prioritization
create index if not exists idx_maintenance_requests_urgency on maintenance_requests(urgency);

-- index on issue_type for filtering by problem type
create index if not exists idx_maintenance_requests_issue_type on maintenance_requests(issue_type);

-- create indexes for artisans table
-- index on user_id for quick lookups by user
create index if not exists idx_artisans_user_id on artisans(user_id);

-- index on specializations for service matching
create index if not exists idx_artisans_specializations on artisans using gin(specializations);

-- index on city for location-based searches
create index if not exists idx_artisans_city on artisans(city);

-- index on verification_status for filtering verified artisans
create index if not exists idx_artisans_verification_status on artisans(verification_status);

-- index on average_rating for sorting by quality
create index if not exists idx_artisans_average_rating on artisans(average_rating desc);

-- create indexes for artisan_reviews table
-- index on artisan_id for quick lookups by artisan
create index if not exists idx_artisan_reviews_artisan_id on artisan_reviews(artisan_id);

-- index on reviewer_id for quick lookups by reviewer
create index if not exists idx_artisan_reviews_reviewer_id on artisan_reviews(reviewer_id);

-- index on rating for filtering by review quality
create index if not exists idx_artisan_reviews_rating on artisan_reviews(rating);

-- create trigger to automatically update updated_at timestamp for maintenance_requests
-- this trigger fires before any update on the maintenance_requests table

create trigger trigger_update_maintenance_requests_updated_at
    before update on maintenance_requests
    for each row
    execute function update_profiles_updated_at();

-- create trigger to automatically update updated_at timestamp for artisans
-- this trigger fires before any update on the artisans table

create trigger trigger_update_artisans_updated_at
    before update on artisans
    for each row
    execute function update_profiles_updated_at();

-- create trigger to automatically update updated_at timestamp for artisan_reviews
-- this trigger fires before any update on the artisan_reviews table

create trigger trigger_update_artisan_reviews_updated_at
    before update on artisan_reviews
    for each row
    execute function update_profiles_updated_at();

-- create function to update artisan average rating
-- this function recalculates an artisan's average rating when reviews are added or modified
create or replace function update_artisan_rating()
returns trigger as $$
begin
    -- update artisan's average rating and total jobs
    update artisans
    set
        average_rating = (
            select coalesce(avg(rating), 0)
            from artisan_reviews
            where artisan_id = coalesce(new.artisan_id, old.artisan_id)
        ),
        total_jobs = (
            select count(*)
            from artisan_reviews
            where artisan_id = coalesce(new.artisan_id, old.artisan_id)
        ),
        updated_at = now()
    where id = coalesce(new.artisan_id, old.artisan_id);

    return coalesce(new, old);
end;
$$ language plpgsql;

-- create trigger to update artisan rating when reviews change
-- this trigger fires after insert, update, or delete on artisan_reviews

create trigger trigger_update_artisan_rating
    after insert or update or delete on artisan_reviews
    for each row
    execute function update_artisan_rating();