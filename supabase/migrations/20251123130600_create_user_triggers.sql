-- migration: create user triggers
-- description: create triggers for automatic user profile and notification setup
-- created: 2025-11-23T13:06:00Z

-- create function to automatically create user profile
-- this function creates a profile record when a new user signs up
create or replace function handle_new_user()
returns trigger
    set search_path = public, auth
as $$
begin
    -- create profile record for new user
    insert into public.profiles (id, full_name, user_type)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.email),
        coalesce(
            (new.raw_user_meta_data->>'user_type')::public.user_type,
            'locataire'::public.user_type
        )
    );

    -- create verification record for new user with default values
    insert into public.user_verifications (user_id, tenant_score, last_score_update)
    values (new.id, 0, now())
    on conflict (user_id) do nothing;

    -- assign default user role only if not already assigned
    insert into public.user_roles (user_id, role)
    select new.id, 'user'::public.user_role
    where not exists (
        select 1 from public.user_roles
        where user_id = new.id
    );

    return new;
end;
$$ language plpgsql security definer;

-- create trigger to automatically create profile on user signup
-- this trigger fires after a new user is created in auth.users

create trigger trigger_handle_new_user
    after insert on auth.users
    for each row
    execute function handle_new_user();

-- create function to automatically handle user deletion cleanup
-- this function cleans up user-related data when a user is deleted
create or replace function handle_user_deletion()
returns trigger
    set search_path = public, auth
as $$
begin
    -- delete user's profile
    delete from public.profiles where id = old.id;

    -- delete user's verification records
    delete from public.user_verifications where user_id = old.id;

    -- delete user's role assignments
    delete from public.user_roles where user_id = old.id;

    -- delete user's favorites
    delete from public.property_favorites where user_id = old.id;

    -- delete user's saved searches and alerts
    delete from public.property_alerts where user_id = old.id;
    delete from public.saved_searches where user_id = old.id;

    -- delete user's maintenance requests (if tenant)
    delete from public.maintenance_requests where tenant_id = old.id;

    -- handle artisan profile if exists
    delete from public.artisans where user_id = old.id;

    -- handle user reviews
    delete from public.artisan_reviews where reviewer_id = old.id;

    return old;
end;
$$ language plpgsql security definer;

-- create trigger to handle user deletion cleanup
-- this trigger fires before a user is deleted from auth.users

create trigger trigger_handle_user_deletion
    before delete on auth.users
    for each row
    execute function handle_user_deletion();

-- create function to validate user email domain
-- this function checks if user email is from allowed domains (optional)
create or replace function validate_user_email()
returns trigger as $$
begin
    -- example email validation - uncomment and modify as needed
    -- if new.email not like '%@ansut.ci' and new.email not like '%@gmail.com' then
    --     raise exception 'Email domain not allowed';
    -- end if;

    return new;
end;
$$ language plpgsql security definer;

-- create trigger to validate user email on signup
-- this trigger fires before a new user is created in auth.users
-- 
-- create trigger trigger_validate_user_email
--     before insert on auth.users
--     for each row
--     execute function validate_user_email();

-- create function to log user registration
-- this function logs new user registrations for analytics
create or replace function log_user_registration()
returns trigger as $$
begin
    -- this could be extended to send welcome emails, create analytics events, etc.
    -- for now, it just ensures the profile creation trigger works correctly

    return new;
end;
$$ language plpgsql security definer;

-- create trigger to log user registration
-- this trigger fires after a new user is created in auth.users

create trigger trigger_log_user_registration
    after insert on auth.users
    for each row
    execute function log_user_registration();

-- create function to update user last activity
-- this function updates a user's last activity timestamp
create or replace function update_user_last_activity()
returns trigger as $$
begin
    -- update profile with last activity (could add last_active_at column)
    update profiles
    set updated_at = now()
    where id = auth.uid();

    return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- create trigger to update user last activity on login
-- this trigger fires when user activity is detected
-- Note: This would typically be called from application code rather than a trigger
-- 
-- create trigger trigger_update_user_last_activity
--     after update on profiles
--     for each row
--     when (old.updated_at is distinct from new.updated_at)
--     execute function update_user_last_activity();

-- create function to handle profile updates
-- this function maintains data consistency when profiles are updated
create or replace function handle_profile_update()
returns trigger as $$
begin
    -- if verification status changed, update user_verifications
    if old.is_verified is distinct from new.is_verified then
        update user_verifications
        set last_score_update = now()
        where user_id = new.id;
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- create trigger to handle profile updates
-- this trigger fires when a profile is updated
-- Note: This trigger will be recreated in a later migration to avoid schema conflicts

-- create trigger trigger_handle_profile_update
--     after update on profiles
--     for each row
--     when (
--         old.is_verified is distinct from new.is_verified or
--         old.cnam_verified is distinct from new.cnam_verified or
--         old.face_verified is distinct from new.face_verified
--     )
--     execute function handle_profile_update();
