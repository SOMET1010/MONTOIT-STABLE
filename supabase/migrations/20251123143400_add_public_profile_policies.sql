-- migration: add_public_profile_policies
-- description: add policies for public access to owner profiles and missing functions
-- created: 2025-11-23T14:34:00Z

-- add policy for anonymous users to view property owner profiles
-- this allows potential tenants to see basic owner information
create policy "anyone can view property owner profiles"
    on profiles for select
    to anon, authenticated
    using (
        user_type = 'proprietaire' and
        is_verified = true
    );

-- create increment_view_count function for property analytics
create function increment_view_count(property_id_to_update uuid)
returns integer as $$
declare
    new_count integer;
begin
    update properties
    set view_count = view_count + 1,
        updated_at = now()
    where id = property_id_to_update
    returning view_count into new_count;

    return new_count;
end;
$$ language plpgsql security definer;

-- grant execute permission on the function to authenticated and anonymous users
grant execute on function increment_view_count(uuid) to anon, authenticated;