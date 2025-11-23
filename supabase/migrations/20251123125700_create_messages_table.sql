-- migration: create messages table
-- description: create messages table for user communications
-- created: 2025-11-23T12:57:00Z

-- create messages table to handle user communications
-- this table stores messages between users regarding properties and applications
create table if not exists messages (
    -- primary key
    id uuid primary key default gen_random_uuid(),

    -- message participants
    sender_id uuid references auth.users on delete cascade not null,
    receiver_id uuid references auth.users on delete cascade not null,

    -- optional application reference
    application_id uuid references rental_applications on delete set null,

    -- message content
    content text not null,

    -- message status
    is_read boolean default false,
    read_at timestamptz,

    -- timestamps
    created_at timestamptz default now()
);

-- enable row level security on messages table
-- ensures users can only access messages they are involved in
alter table messages enable row level security;

-- create policy for users to view their own messages
-- allows authenticated users to view messages they sent or received
create policy "users can view own messages"
    on messages for select
    to authenticated
    using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- create policy for users to send messages
-- allows authenticated users to create new messages
create policy "users can send messages"
    on messages for insert
    to authenticated
    with check (auth.uid() = sender_id);

-- create policy for users to mark messages as read
-- allows message recipients to update read status
create policy "users can update read status"
    on messages for update
    to authenticated
    using (auth.uid() = receiver_id)
    with check (auth.uid() = receiver_id);

-- create indexes for performance optimization
-- index on sender_id for quick lookups by sender
create index if not exists idx_messages_sender_id on messages(sender_id);

-- index on receiver_id for quick lookups by receiver
create index if not exists idx_messages_receiver_id on messages(receiver_id);

-- index on application_id for filtering by application
create index if not exists idx_messages_application_id on messages(application_id);

-- index on is_read for filtering unread messages
create index if not exists idx_messages_is_read on messages(is_read);

-- index on created_at for sorting by message date
create index if not exists idx_messages_created_at on messages(created_at);

-- composite index for message threads
create index if not exists idx_messages_conversation on messages(
    least(sender_id, receiver_id),
    greatest(sender_id, receiver_id),
    created_at desc
);