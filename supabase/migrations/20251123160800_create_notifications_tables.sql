-- migration: create notifications and notification_preferences tables
-- description: create notification system tables with row level security
-- created: 2025-11-23T16:08:00Z

-- create notifications table to store system notifications
create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    type text not null,
    title text not null,
    message text not null,
    channels text[] default array['in_app'],
    read boolean default false,
    read_at timestamptz,
    action_url text,
    action_label text,
    metadata jsonb default '{}',
    priority text default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on notifications table
alter table notifications enable row level security;

-- create policy for users to view their own notifications
create policy "users can view own notifications"
    on notifications for select
    to authenticated
    using (auth.uid() = user_id);

-- create policy for users to update their own notifications
create policy "users can update own notifications"
    on notifications for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create policy for system to create notifications
create policy "system can create notifications"
    on notifications for insert
    to authenticated
    with check (true);

-- create indexes for notifications table
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_read on notifications(read);
create index if not exists idx_notifications_created_at on notifications(created_at);
create index if not exists idx_notifications_type on notifications(type);

-- create notification_preferences table to store user notification preferences
create table if not exists notification_preferences (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users on delete cascade,
    email_enabled boolean default true,
    sms_enabled boolean default true,
    whatsapp_enabled boolean default true,
    push_enabled boolean default true,
    in_app_enabled boolean default true,
    email_types text[] default array['all'],
    sms_types text[] default array['payment_reminder', 'visit_reminder', 'contract_expiring'],
    whatsapp_types text[] default array['payment_received', 'visit_scheduled', 'contract_signed'],
    push_types text[] default array['message_received', 'application_received'],
    quiet_hours_enabled boolean default false,
    quiet_hours_start time default '22:00:00',
    quiet_hours_end time default '08:00:00',
    whatsapp_phone text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on notification_preferences table
alter table notification_preferences enable row level security;

-- create policy for users to view their own notification preferences
create policy "users can view own notification preferences"
    on notification_preferences for select
    to authenticated
    using (auth.uid() = user_id);

-- create policy for users to update their own notification preferences
create policy "users can update own notification preferences"
    on notification_preferences for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create policy for users to insert their own notification preferences
create policy "users can insert own notification preferences"
    on notification_preferences for insert
    to authenticated
    with check (auth.uid() = user_id);

-- create policy for upsert (update + insert) notification preferences
create policy "users can upsert own notification preferences"
    on notification_preferences for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create indexes for notification_preferences table
create index if not exists idx_notification_preferences_user_id on notification_preferences(user_id);

-- create function to automatically update updated_at timestamp for notifications
create or replace function update_notifications_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- create trigger to automatically update updated_at timestamp for notifications
create trigger trigger_update_notifications_updated_at
    before update on notifications
    for each row
    execute function update_notifications_updated_at();

-- create function to automatically update updated_at timestamp for notification_preferences
create or replace function update_notification_preferences_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- create trigger to automatically update updated_at timestamp for notification_preferences
create trigger trigger_update_notification_preferences_updated_at
    before update on notification_preferences
    for each row
    execute function update_notification_preferences_updated_at();

-- create RPC function to get unread notification count
create or replace function get_unread_notification_count(p_user_id uuid default auth.uid())
returns integer as $$
declare
    notification_count integer;
begin
    select count(*) into notification_count
    from notifications
    where user_id = p_user_id and read = false;
    
    return notification_count;
end;
$$ language plpgsql security definer;

-- create RPC function to mark notification as read
create or replace function mark_notification_read(p_notification_id uuid)
returns boolean as $$
declare
    notification_exists boolean;
begin
    select exists(
        select 1 from notifications 
        where id = p_notification_id and user_id = auth.uid()
    ) into notification_exists;
    
    if not notification_exists then
        return false;
    end if;
    
    update notifications 
    set read = true, read_at = now()
    where id = p_notification_id and user_id = auth.uid();
    
    return true;
end;
$$ language plpgsql security definer;

-- create RPC function to mark all notifications as read
create or replace function mark_all_notifications_read(p_user_id uuid default auth.uid())
returns integer as $$
declare
    updated_count integer;
begin
    update notifications 
    set read = true, read_at = now()
    where user_id = p_user_id and read = false;
    
    get diagnostics updated_count = row_count;
    return updated_count;
end;
$$ language plpgsql security definer;

-- create RPC function to create notification
create or replace function create_notification(
    p_user_id uuid,
    p_type text,
    p_title text,
    p_message text,
    p_channels text[] default array['in_app'],
    p_action_url text default null,
    p_action_label text default null,
    p_metadata jsonb default '{}',
    p_priority text default 'normal'
)
returns uuid as $$
declare
    notification_id uuid;
begin
    insert into notifications (
        user_id,
        type,
        title,
        message,
        channels,
        action_url,
        action_label,
        metadata,
        priority
    )
    values (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_channels,
        p_action_url,
        p_action_label,
        p_metadata,
        p_priority
    )
    returning id into notification_id;
    
    return notification_id;
end;
$$ language plpgsql security definer;