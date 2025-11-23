-- migration: create user verifications table
-- description: create user verifications table for document verification
-- created: 2025-11-23T12:55:00Z

-- create user_verifications table to store verification status and documents
-- this table manages user identity verification through various services
create table if not exists user_verifications (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- foreign key to auth.users with unique constraint
    user_id uuid references auth.users on delete cascade not null unique,

    -- oneci verification (national identity)
    oneci_status verification_status default 'en_attente',
    oneci_verified_at timestamptz,
    oneci_document_url text,
    oneci_number text,

    -- cnam verification (health insurance)
    cnam_status verification_status default 'en_attente',
    cnam_verified_at timestamptz,
    cnam_document_url text,
    cnam_number text,

    -- facial verification
    face_verification_status verification_status default 'en_attente',
    face_verified_at timestamptz,
    face_verification_confidence integer,
    face_verification_data jsonb,
    selfie_image_url text,

    -- scoring system
    tenant_score integer default 0,
    profile_completeness_score integer default 0,
    rental_history_score integer default 0,
    payment_reliability_score integer default 0,
    last_score_update timestamptz default now(),

    -- certification flags
    ansut_certified boolean default false,
    ansut_certified_at timestamptz,

    -- rejection information
    rejection_reason text,
    verification_notes text,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on user_verifications table
-- ensures users can only access their own verification data
alter table user_verifications enable row level security;

-- create policy for users to view their own verifications
-- allows authenticated users to read their own verification status
create policy "users can view own verifications"
    on user_verifications for select
    to authenticated
    using (auth.uid() = user_id);

-- create policy for users to insert their verifications
-- allows authenticated users to create their verification records
create policy "users can insert own verifications"
    on user_verifications for insert
    to authenticated
    with check (auth.uid() = user_id);

-- create policy for users to update their verifications
-- allows authenticated users to modify their verification records
create policy "users can update own verifications"
    on user_verifications for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create policy for system to manage verifications
-- allows admin users to manage all verification records
create policy "system can manage verifications"
    on user_verifications for all
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.user_type = 'admin_ansut'
        )
    );

-- create indexes for performance optimization
-- index on user_id for quick verification lookups
create index if not exists idx_user_verifications_user_id on user_verifications(user_id);

-- index on oneci_status for filtering by verification status
create index if not exists idx_user_verifications_oneci_status on user_verifications(oneci_status);

-- index on cnam_status for filtering by verification status
create index if not exists idx_user_verifications_cnam_status on user_verifications(cnam_status);

-- index on ansut_certified for filtering certified users
create index if not exists idx_user_verifications_ansut_certified on user_verifications(ansut_certified);

-- index on tenant_score for sorting by score
create index if not exists idx_user_verifications_tenant_score on user_verifications(tenant_score);

-- create function to automatically update ansut certification
-- this function triggers when verification statuses are updated
create or replace function update_ansut_certification()
returns trigger as $$
begin
    -- check if user has completed all required verifications
    if new.oneci_status = 'verifie' and new.face_verification_status = 'verifie' then
        new.ansut_certified := true;
        new.ansut_certified_at := now();

        -- update profile table
        update profiles
        set
            is_verified = true,
            ansut_certified = true,
            ansut_certified_at = now()
        where id = new.user_id;
    end if;

    return new;
end;
$$ language plpgsql;

-- create trigger to auto-update ansut certification
-- this trigger fires before any update on user_verifications

create trigger trigger_update_ansut_certification
    before update on user_verifications
    for each row
    execute function update_ansut_certification();

-- create trigger to automatically update updated_at timestamp
-- this trigger fires before any update on the user_verifications table

create trigger trigger_update_user_verifications_updated_at
    before update on user_verifications
    for each row
    execute function update_profiles_updated_at();