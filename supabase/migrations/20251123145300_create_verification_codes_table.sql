-- migration: create verification_codes_table
-- description: create table for storing email/SMS/WhatsApp verification codes
-- created: 2025-11-23T14:53:00Z

-- create verification_codes table to store OTP codes
-- this table manages temporary verification codes for user authentication
create table if not exists verification_codes (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- contact information
    identifier text not null, -- email or phone number
    type text not null check (type in ('email', 'sms', 'whatsapp')),

    -- verification code
    code text not null check (char_length(code) = 6),

    -- timestamps
    created_at timestamptz default now(),
    expires_at timestamptz not null,
    used_at timestamptz,

    -- status
    is_used boolean default false
);

-- enable row level security on verification_codes table
-- controls access to verification codes
alter table verification_codes enable row level security;

-- create policy for system to manage verification codes
-- allows the system to create and manage verification codes
create policy "system can manage verification codes"
    on verification_codes for all
    to authenticated
    using (true)
    with check (true);

-- create indexes for performance optimization
-- index on identifier for quick lookups by contact
create index if not exists idx_verification_codes_identifier on verification_codes(identifier);

-- index on type for filtering by verification type
create index if not exists idx_verification_codes_type on verification_codes(type);

-- index on expires_at for cleanup of expired codes
create index if not exists idx_verification_codes_expires_at on verification_codes(expires_at);

-- index on is_used for filtering unused codes
create index if not exists idx_verification_codes_is_used on verification_codes(is_used);

-- create function to cleanup expired verification codes
-- this function removes expired codes to keep the table clean
create or replace function cleanup_expired_verification_codes()
returns void as $$
begin
    delete from verification_codes
    where expires_at < now() or (is_used = true and created_at < now() - interval '1 hour');
end;
$$ language plpgsql security definer;

-- create function to verify a code
-- this function checks if a verification code is valid and marks it as used
create or replace function verify_code(
    identifier_input text,
    code_input text,
    type_input text
)
returns boolean as $$
declare
    code_valid boolean := false;
    code_exists boolean := false;
begin
    -- Check if code exists, is not used, and is not expired
    select exists(
        select 1 from verification_codes
        where identifier = identifier_input
        and code = code_input
        and type = type_input
        and is_used = false
        and expires_at > now()
    ) into code_exists;

    if code_exists then
        -- Mark the code as used
        update verification_codes
        set is_used = true,
            used_at = now()
        where identifier = identifier_input
        and code = code_input
        and type = type_input;

        code_valid := true;
    end if;

    return code_valid;
end;
$$ language plpgsql security definer;

-- grant execute permission on functions to authenticated users
grant execute on function cleanup_expired_verification_codes() to authenticated;
grant execute on function verify_code(text, text, text) to authenticated;