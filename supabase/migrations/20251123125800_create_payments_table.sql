-- migration: create payments table
-- description: create payments table for financial transactions
-- created: 2025-11-23T12:58:00Z

-- create payments table to handle all financial transactions
-- this table tracks payments between tenants, landlords, and the platform
create table if not exists payments (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- payment participants
    payer_id uuid references auth.users on delete cascade not null,
    receiver_id uuid references auth.users on delete cascade not null,

    -- optional property reference
    property_id uuid references properties on delete set null,

    -- payment details
    amount decimal(10,2) not null,
    payment_type payment_type not null,
    payment_method payment_method not null,
    status payment_status default 'en_attente',

    -- transaction information
    transaction_reference text,
    notes text,

    -- intouch payment integration
    intouch_transaction_id varchar(100),
    intouch_status varchar(50),
    intouch_callback_data jsonb,

    -- timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on payments table
-- controls access to payment data based on user involvement
alter table payments enable row level security;

-- create policy for users to view their own payments
-- allows authenticated users to view payments they sent or received
create policy "users can view own payments"
    on payments for select
    to authenticated
    using (auth.uid() = payer_id or auth.uid() = receiver_id);

-- create policy for users to create payments
-- allows authenticated users to initiate new payments
create policy "users can create payments"
    on payments for insert
    to authenticated
    with check (auth.uid() = payer_id);

-- create policy for payment recipients to update payment status
-- allows payment recipients to confirm or reject payments
create policy "recipients can update payment status"
    on payments for update
    to authenticated
    using (auth.uid() = receiver_id)
    with check (auth.uid() = receiver_id);

-- create policy for system to manage payments
-- allows admin users to manage all payment records
create policy "system can manage payments"
    on payments for all
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.user_type = 'admin_ansut'
        )
    );

-- create indexes for performance optimization
-- index on payer_id for quick lookups by payer
create index if not exists idx_payments_payer_id on payments(payer_id);

-- index on receiver_id for quick lookups by receiver
create index if not exists idx_payments_receiver_id on payments(receiver_id);

-- index on property_id for filtering by property
create index if not exists idx_payments_property_id on payments(property_id);

-- index on status for filtering by payment status
create index if not exists idx_payments_status on payments(status);

-- index on payment_type for filtering by payment category
create index if not exists idx_payments_type on payments(payment_type);

-- index on created_at for sorting by payment date
create index if not exists idx_payments_created_at on payments(created_at);

-- index on intouch transaction id for payment provider integration
create index if not exists idx_payments_intouch_transaction_id on payments(intouch_transaction_id);

-- composite index for payment tracking
create index if not exists idx_payments_tracking on payments(payer_id, receiver_id, status, created_at desc);

-- create trigger to automatically update updated_at timestamp
-- this trigger fires before any update on the payments table

create trigger trigger_update_payments_updated_at
    before update on payments
    for each row
    execute function update_profiles_updated_at();