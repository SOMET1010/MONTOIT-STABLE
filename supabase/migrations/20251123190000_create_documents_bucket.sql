-- migration: create documents bucket for agency uploads
-- created: 2025-11-23T19:00:00Z

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'documents',
    'documents',
    false,
    20971520, -- 20MB
    array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- policies: authenticated users can manage documents (private bucket)
create policy "documents select" on storage.objects
    for select to authenticated
    using (bucket_id = 'documents');

create policy "documents insert" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'documents');

create policy "documents update" on storage.objects
    for update to authenticated
    using (bucket_id = 'documents');

create policy "documents delete" on storage.objects
    for delete to authenticated
    using (bucket_id = 'documents');
