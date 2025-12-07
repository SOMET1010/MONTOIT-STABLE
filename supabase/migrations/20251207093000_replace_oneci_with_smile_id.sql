-- migration: replace ONECI with Smile ID
-- description: update verification system to use Smile ID instead of ONECI
-- created: 2025-12-07T09:30:00Z

-- Update user_verifications table to replace ONECI fields with Smile ID
do $$
begin
    -- Check if column exists and rename it
    if exists (
        select 1 from information_schema.columns
        where table_name = 'user_verifications'
        and column_name = 'oneci_status'
    ) then
        alter table user_verifications rename column oneci_status to smile_id_status;
    end if;

    if exists (
        select 1 from information_schema.columns
        where table_name = 'user_verifications'
        and column_name = 'oneci_verified_at'
    ) then
        alter table user_verifications rename column oneci_verified_at to smile_id_verified_at;
    end if;

    if exists (
        select 1 from information_schema.columns
        where table_name = 'user_verifications'
        and column_name = 'oneci_document_url'
    ) then
        alter table user_verifications rename column oneci_document_url to smile_id_document_url;
    end if;

    if exists (
        select 1 from information_schema.columns
        where table_name = 'user_verifications'
        and column_name = 'oneci_number'
    ) then
        alter table user_verifications rename column oneci_number to smile_id_partner_id;
    end if;
end $$;

-- Add new Smile ID specific columns
do $$
begin
    alter table user_verifications add column if not exists smile_id_job_id text;
    alter table user_verifications add column if not exists smile_id_job_type text;
    alter table user_verifications add column if not exists smile_id_callback_url text;
    alter table user_verifications add column if not exists smile_id_verification_method text default 'biometric'; -- biometric, document, smart_card
    alter table user_verifications add column if not exists smile_id_id_type text default 'NATIONAL_ID'; -- NATIONAL_ID, PASSPORT, DRIVING_LICENSE
    alter table user_verifications add column if not exists smile_id_country_code text default 'CI';
    alter table user_verifications add column if not exists smile_id_partner_params jsonb default '{}';
    alter table user_verifications add column if not exists smile_id_enrolled_at timestamptz;
    alter table user_verifications add column if not exists smile_id_result_data jsonb default '{}';
exception
    when duplicate_column then null;
end $$;

-- Add new Smile ID columns to profiles if they don't exist
do $$
begin
    alter table profiles add column if not exists smile_id_verified boolean default false;
    alter table profiles add column if not exists smile_id_verified_at timestamptz;
    alter table profiles add column if not exists smile_id_partner_id text;
exception
    when duplicate_column then null;
end $$;

-- Create indexes for Smile ID fields
create index if not exists idx_user_verifications_smile_id_job_id on user_verifications(smile_id_job_id);
create index if not exists idx_user_verifications_smile_id_status on user_verifications(smile_id_status);
create index if not exists idx_profiles_smile_id_verified on profiles(smile_id_verified);

-- Update the verification status enum to include Smile ID specific statuses
do $$
begin
    alter type verification_status add value 'submitted';
    alter type verification_status add value 'processing';
exception
    when duplicate_object then null;
end $$;

-- Create or replace view for Smile ID verification stats
create or replace view smile_id_verification_stats as
select
    count(*) as total_verifications,
    count(*) filter (where smile_id_verified = true) as verified_count,
    date_trunc('month', smile_id_verified_at) as month
from profiles
where smile_id_verified_at is not null
group by
    date_trunc('month', smile_id_verified_at)
order by month desc;