/*
  # Critical Fix: Create Profiles Table with Proper Permissions
  
  ## Problem
  The profiles table does not exist in the database, causing "Could not find the table 'public.profiles' in the schema cache" errors.
  
  ## Solution
  1. Create the profiles table with all necessary columns
  2. Set up proper Row Level Security (RLS) policies
  3. Grant table-level permissions to anon and authenticated roles
  4. Create helper functions for profile management
  5. Set up triggers for automatic profile creation
  
  ## Tables Created
  - `profiles` - User profiles with all fields
  - Helper functions for profile management
  
  ## Security
  - RLS enabled on profiles table
  - Table grants for anon (SELECT) and authenticated (ALL)
  - Policies for viewing and updating profiles
  - Automatic profile creation on user signup
*/

-- =====================================================
-- STEP 1: Create user_type enum if not exists
-- =====================================================

DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('locataire', 'proprietaire', 'agence', 'admin_ansut');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- STEP 2: Create profiles table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  user_type user_type DEFAULT 'locataire',
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  oneci_verified BOOLEAN DEFAULT false,
  cnam_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  profile_setup_completed BOOLEAN DEFAULT false,
  active_role TEXT,
  verification_level TEXT DEFAULT 'basic',
  verification_preferences JSONB DEFAULT '{"email": true, "sms": false, "biometric": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- STEP 3: Enable RLS
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Drop existing policies if any
-- =====================================================

DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;
DROP POLICY IF EXISTS "Anon can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

-- =====================================================
-- STEP 5: Create RLS policies
-- =====================================================

-- Service role bypass (for admin operations)
CREATE POLICY "Service role has full access"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon users can view all profiles (needed for property listings)
CREATE POLICY "Anon can view profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can view all profiles
CREATE POLICY "Authenticated can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Authenticated can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Authenticated users can update their own profile
CREATE POLICY "Authenticated can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Authenticated users can delete their own profile
CREATE POLICY "Authenticated can delete own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- =====================================================
-- STEP 6: Grant table-level permissions
-- =====================================================

-- Grant SELECT to anon role (needed for public listings)
GRANT SELECT ON public.profiles TO anon;

-- Grant all operations to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Grant all to service_role
GRANT ALL ON public.profiles TO service_role;

-- =====================================================
-- STEP 7: Create helper functions
-- =====================================================

-- Function to check if profile exists
CREATE OR REPLACE FUNCTION public.profile_exists(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure profile exists for current user
CREATE OR REPLACE FUNCTION public.ensure_my_profile_exists()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_full_name TEXT;
  v_user_type user_type;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    RETURN true;
  END IF;
  
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  SELECT COALESCE(raw_user_meta_data->>'full_name', '') INTO v_full_name FROM auth.users WHERE id = v_user_id;
  SELECT COALESCE((raw_user_meta_data->>'user_type')::user_type, 'locataire') INTO v_user_type FROM auth.users WHERE id = v_user_id;
  
  INSERT INTO public.profiles (id, email, full_name, user_type, profile_setup_completed)
  VALUES (v_user_id, v_email, v_full_name, v_user_type, false)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, phone, profile_setup_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'locataire'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type,
    phone = EXCLUDED.phone;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 8: Create triggers
-- =====================================================

-- Trigger for automatic profile creation on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updating updated_at timestamp
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- STEP 9: Grant function permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION public.profile_exists(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.ensure_my_profile_exists() TO authenticated;

-- =====================================================
-- STEP 10: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- =====================================================
-- STEP 11: Add helpful comments
-- =====================================================

COMMENT ON TABLE public.profiles IS 'User profiles with RLS enabled. Table grants allow queries, RLS policies control row access.';
COMMENT ON FUNCTION public.profile_exists IS 'Check if a profile exists for a given user ID';
COMMENT ON FUNCTION public.ensure_my_profile_exists IS 'Ensure the current user has a profile, creating it if necessary';

-- =====================================================
-- STEP 12: Create profiles for existing users
-- =====================================================

-- Insert profiles for any existing auth.users that don't have profiles
INSERT INTO public.profiles (id, email, full_name, user_type, profile_setup_completed)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE((u.raw_user_meta_data->>'user_type')::user_type, 'locataire'),
  false
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;
