-- migration: create leases table
-- description: create leases table for rental contracts
-- created: 2025-11-23T12:59:00Z

-- create leases table to manage rental contracts
-- this table stores legally binding rental agreements between tenants and landlords
create table if not exists leases (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- lease relationships
    property_id uuid references properties on delete cascade not null,
    landlord_id uuid references auth.users on delete cascade not null,
    tenant_id uuid references auth.users on delete cascade not null,

    -- lease details
    lease_type lease_type not null,
    start_date date not null,
    end_date date,
    monthly_rent decimal(10,2) not null,
    deposit_amount decimal(10,2) not null,
    charges_amount decimal(10,2) default 0,
    payment_day integer check (payment_day >= 1 and payment_day <= 31) default 1,

    -- lease status and content
    status lease_status default 'brouillon',
    contract_content text,
    custom_clauses text,

    -- traditional signatures
    landlord_signature text,
    tenant_signature text,
    landlord_signed_at timestamptz,
    tenant_signed_at timestamptz,
    landlord_ip_address text,
    tenant_ip_address text,

    -- electronic signatures with cryptoneo
    pdf_document_url text,
    signed_pdf_url text,
    tenant_certificate_id text,
    landlord_certificate_id text,
    tenant_otp_verified_at timestamptz,
    landlord_otp_verified_at timestamptz,
    signature_timestamp timestamptz,

    -- lease lifecycle
    activation_date timestamptz,
    termination_date timestamptz,
    termination_reason text,
    terminated_by uuid references auth.users on delete set null,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on leases table
-- controls access to lease data based on user involvement
alter table leases enable row level security;

-- create policy for landlords to view their leases
-- allows property owners to view leases they created
create policy "landlords can view own leases"
    on leases for select
    to authenticated
    using (auth.uid() = landlord_id);

-- create policy for tenants to view their leases
-- allows tenants to view leases they signed
create policy "tenants can view their leases"
    on leases for select
    to authenticated
    using (auth.uid() = tenant_id);

-- create policy for landlords to create leases
-- allows property owners to create new lease agreements
create policy "landlords can create leases"
    on leases for insert
    to authenticated
    with check (auth.uid() = landlord_id);

-- create policy for landlords to update leases
-- allows property owners to modify lease agreements
create policy "landlords can update leases"
    on leases for update
    to authenticated
    using (auth.uid() = landlord_id)
    with check (auth.uid() = landlord_id);

-- create policy for tenants to sign leases
-- allows tenants to update leases for signature purposes
create policy "tenants can sign leases"
    on leases for update
    to authenticated
    using (auth.uid() = tenant_id)
    with check (auth.uid() = tenant_id);

-- create policy for system to manage leases
-- allows admin users to manage all lease records
create policy "system can manage leases"
    on leases for all
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.user_type = 'admin_ansut'
        )
    );

-- create indexes for performance optimization
-- index on property_id for quick lease lookups by property
create index if not exists idx_leases_property_id on leases(property_id);

-- index on landlord_id for quick lease lookups by landlord
create index if not exists idx_leases_landlord_id on leases(landlord_id);

-- index on tenant_id for quick lease lookups by tenant
create index if not exists idx_leases_tenant_id on leases(tenant_id);

-- index on status for filtering by lease status
create index if not exists idx_leases_status on leases(status);

-- index on start_date and end_date for active lease queries
create index if not exists idx_leases_dates on leases(start_date, end_date);

-- index on created_at for sorting by creation date
create index if not exists idx_leases_created_at on leases(created_at);

-- create function to update lease status based on signatures
-- this function automatically activates leases when both parties sign
create or replace function update_lease_status_on_signatures()
returns trigger as $$
begin
    -- check if both parties have signed
    if new.landlord_signed_at is not null and new.tenant_signed_at is not null then
        new.status := 'actif';
        if new.activation_date is null then
            new.activation_date := now();
        end if;
    elsif new.landlord_signed_at is not null or new.tenant_signed_at is not null then
        if new.status = 'brouillon' then
            new.status := 'en_attente_signature';
        end if;
    end if;

    return new;
end;
$$ language plpgsql;

-- create trigger to auto-update lease status when signatures are added
-- this trigger fires before any update that affects signatures

create trigger trigger_update_lease_status_on_signatures
    before update on leases
    for each row
    when (
        new.landlord_signed_at is distinct from old.landlord_signed_at or
        new.tenant_signed_at is distinct from old.tenant_signed_at or
        new.landlord_signature is distinct from old.landlord_signature or
        new.tenant_signature is distinct from old.tenant_signature
    )
    execute function update_lease_status_on_signatures();

-- create trigger to automatically update updated_at timestamp
-- this trigger fires before any update on the leases table

create trigger trigger_update_leases_updated_at
    before update on leases
    for each row
    execute function update_profiles_updated_at();