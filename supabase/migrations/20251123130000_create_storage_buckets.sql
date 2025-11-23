-- migration: create storage buckets
-- description: create storage buckets for file uploads with security policies
-- created: 2025-11-23T13:00:00Z

-- create storage buckets for file uploads
-- these buckets organize different types of user-uploaded content

-- create avatars bucket for user profile pictures
-- public bucket for profile images with size limits and mime type restrictions
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- create property-images bucket for property photos
-- public bucket for property listing images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'property-images',
    'property-images',
    true,
    10485760, -- 10MB limit
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- create user-documents bucket for private user documents
-- private bucket for sensitive documents like IDs and contracts
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'user-documents',
    'user-documents',
    false,
    10485760, -- 10MB limit
    array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- create contract-documents bucket for legal documents
-- private bucket for contracts and legal paperwork
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'contract-documents',
    'contract-documents',
    false,
    20971520, -- 20MB limit
    array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- create verification-documents bucket for identity verification
-- private bucket for ID cards and verification documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'verification-documents',
    'verification-documents',
    false,
    10485760, -- 10MB limit
    array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- ============================================
-- storage policies for avatars bucket
-- ============================================

-- policy: public can read avatars
-- allows anyone to view profile images
create policy "avatar images are publicly accessible"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'avatars');

-- policy: users can upload their own avatar
-- allows authenticated users to upload their profile picture
create policy "users can upload their own avatar"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'avatars'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- policy: users can update their own avatar
-- allows authenticated users to replace their profile picture
create policy "users can update their own avatar"
    on storage.objects for update
    to authenticated
    using (
        bucket_id = 'avatars'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- policy: users can delete their own avatar
-- allows authenticated users to remove their profile picture
create policy "users can delete their own avatar"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'avatars'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================
-- storage policies for property-images bucket
-- ============================================

-- policy: public can read property images
-- allows anyone to view property listing photos
create policy "property images are publicly accessible"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'property-images');

-- policy: property owners can upload property images
-- allows authenticated users to upload photos for their properties
create policy "property owners can upload images"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'property-images'
    );

-- policy: property owners can update property images
-- allows authenticated users to modify their property photos
create policy "property owners can update images"
    on storage.objects for update
    to authenticated
    using (
        bucket_id = 'property-images'
        and (
            exists (
                select 1 from properties
                where properties.id::text = (storage.foldername(name))[1]
                and properties.owner_id = auth.uid()
            )
        )
    );

-- policy: property owners can delete property images
-- allows authenticated users to remove their property photos
create policy "property owners can delete images"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'property-images'
        and (
            exists (
                select 1 from properties
                where properties.id::text = (storage.foldername(name))[1]
                and properties.owner_id = auth.uid()
            )
        )
    );

-- ============================================
-- storage policies for user-documents bucket
-- ============================================

-- policy: users can view their own documents
-- allows users to access their private documents
create policy "users can view their own documents"
    on storage.objects for select
    to authenticated
    using (
        bucket_id = 'user-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- policy: users can upload their own documents
-- allows users to add private documents to their account
create policy "users can upload their own documents"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'user-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- policy: users can update their own documents
-- allows users to modify their private documents
create policy "users can update their own documents"
    on storage.objects for update
    to authenticated
    using (
        bucket_id = 'user-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- policy: users can delete their own documents
-- allows users to remove their private documents
create policy "users can delete their own documents"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'user-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================
-- storage policies for contract-documents bucket
-- ============================================

-- policy: lease parties can view contract documents
-- allows users involved in leases to access contract documents
create policy "lease parties can view contract documents"
    on storage.objects for select
    to authenticated
    using (
        bucket_id = 'contract-documents'
        and (
            -- landlord or tenant can view documents
            exists (
                select 1 from leases
                where leases.id::text = (storage.foldername(name))[1]
                and (leases.landlord_id = auth.uid() or leases.tenant_id = auth.uid())
            )
        )
    );

-- policy: lease parties can upload contract documents
-- allows users to upload documents related to their leases
create policy "lease parties can upload contract documents"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'contract-documents'
        and (
            exists (
                select 1 from leases
                where leases.id::text = (storage.foldername(name))[1]
                and (leases.landlord_id = auth.uid() or leases.tenant_id = auth.uid())
            )
        )
    );

-- ============================================
-- storage policies for verification-documents bucket
-- ============================================

-- policy: users can view their verification documents
-- allows users to access their identity verification documents
create policy "users can view their verification documents"
    on storage.objects for select
    to authenticated
    using (
        bucket_id = 'verification-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- policy: users can upload verification documents
-- allows users to submit documents for identity verification
create policy "users can upload verification documents"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'verification-documents'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- policy: admins can view all verification documents
-- allows admin users to review verification documents
create policy "admins can view verification documents"
    on storage.objects for select
    to authenticated
    using (
        bucket_id = 'verification-documents'
        and (
            exists (
                select 1 from profiles
                where profiles.id = auth.uid()
                and profiles.user_type = 'admin_ansut'
            )
        )
    );