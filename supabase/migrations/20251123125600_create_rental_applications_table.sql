-- migration: create rental applications table
-- description: create rental applications table for property rental requests
-- created: 2025-11-23T12:56:00Z

-- create rental_applications table to manage property rental requests
-- this table tracks applications from tenants to rent properties
create table if not exists rental_applications (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- relationships
    property_id uuid references properties on delete cascade not null,
    applicant_id uuid references auth.users on delete cascade not null,

    -- application status and scoring
    status application_status default 'en_attente',
    application_score integer default 0,

    -- application content
    cover_letter text,
    documents text[] default '{}',

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on rental_applications table
-- controls access to application data based on user roles
alter table rental_applications enable row level security;

-- create policy for applicants to view their own applications
-- allows authenticated users to view applications they submitted
create policy "applicants can view own applications"
    on rental_applications for select
    to authenticated
    using (auth.uid() = applicant_id);

-- create policy for property owners to view applications for their properties
-- allows property owners to view applications for their properties
create policy "owners can view property applications"
    on rental_applications for select
    to authenticated
    using (
        exists (
            select 1 from properties
            where properties.id = rental_applications.property_id
            and properties.owner_id = auth.uid()
        )
    );

-- create policy for applicants to create applications
-- allows authenticated users to submit rental applications
create policy "applicants can create applications"
    on rental_applications for insert
    to authenticated
    with check (auth.uid() = applicant_id);

-- create policy for property owners to update application status
-- allows property owners to accept or reject applications
create policy "owners can update application status"
    on rental_applications for update
    to authenticated
    using (
        exists (
            select 1 from properties
            where properties.id = rental_applications.property_id
            and properties.owner_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from properties
            where properties.id = rental_applications.property_id
            and properties.owner_id = auth.uid()
        )
    );

-- create indexes for performance optimization
-- index on property_id for quick application lookups by property
create index if not exists idx_rental_applications_property_id on rental_applications(property_id);

-- index on applicant_id for quick application lookups by applicant
create index if not exists idx_rental_applications_applicant_id on rental_applications(applicant_id);

-- index on status for filtering by application status
create index if not exists idx_rental_applications_status on rental_applications(status);

-- index on application_score for sorting by score
create index if not exists idx_rental_applications_score on rental_applications(application_score);

-- index on created_at for sorting by submission date
create index if not exists idx_rental_applications_created_at on rental_applications(created_at);

-- composite index for owner queries
create index if not exists idx_rental_applications_owner_query on rental_applications(property_id, status, created_at desc);

-- create trigger to automatically update updated_at timestamp
-- this trigger fires before any update on the rental_applications table

create trigger trigger_update_rental_applications_updated_at
    before update on rental_applications
    for each row
    execute function update_profiles_updated_at();