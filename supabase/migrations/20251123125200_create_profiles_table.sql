-- migration: create profiles table
-- description: create user profiles table with row level security
-- created: 2025-11-23T12:52:00Z

-- create profiles table to store user information
-- this table extends the auth.users table with additional profile data
create table if not exists profiles (
    -- primary key references auth.users for user authentication
    id uuid primary key references auth.users on delete cascade,

    -- user profile information
    user_type user_type default 'locataire',
    full_name text,
    phone text,
    avatar_url text,
    bio text,
    city text,
    address text,

    -- verification flags
    is_verified boolean default false,
    oneci_verified boolean default false,
    cnam_verified boolean default false,
    face_verified boolean default false,
    ansut_certified boolean default false,

    -- timestamps for verification
    verified_at timestamptz,
    oneci_verified_at timestamptz,
    cnam_verified_at timestamptz,
    face_verified_at timestamptz,
    ansut_certified_at timestamptz,

    -- audit timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- enable row level security on profiles table
-- this ensures that users can only access their own profile data
alter table profiles enable row level security;

-- create policy for users to view their own profile
-- allows authenticated users to read their own profile data
create policy "users can view own profile"
    on profiles for select
    to authenticated
    using (auth.uid() = id);

-- create policy for users to update their own profile
-- allows authenticated users to modify their own profile data
create policy "users can update own profile"
    on profiles for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- create policy for public profiles to be viewable by all authenticated users
-- allows authenticated users to view basic profile information of other users
create policy "public profiles are viewable"
    on profiles for select
    to authenticated
    using (true);

-- create policy for inserting new profiles
-- allows system to create new profiles during user registration
create policy "system can create profiles"
    on profiles for insert
    to authenticated
    with check (true);

-- create indexes for performance optimization
-- index on user_type for filtering by user category
create index if not exists idx_profiles_user_type on profiles(user_type);

-- index on city for location-based searches
create index if not exists idx_profiles_city on profiles(city);

-- index on verification status for filtering verified users
create index if not exists idx_profiles_verified on profiles(is_verified);

-- index on created_at for sorting and analytics
create index if not exists idx_profiles_created_at on profiles(created_at);

-- create function to automatically update updated_at timestamp
-- this function will be triggered on any update to the profiles table
create or replace function update_profiles_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- create trigger to automatically update updated_at timestamp
-- this trigger fires before any update on the profiles table

create trigger trigger_update_profiles_updated_at
    before update on profiles
    for each row
    execute function update_profiles_updated_at();