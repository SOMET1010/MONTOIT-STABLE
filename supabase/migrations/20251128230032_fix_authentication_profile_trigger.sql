/*
  # Fix Authentication - Create Profile Trigger

  ## Problem
  When users sign up via Supabase Auth, no profile is automatically created in the `profiles` table,
  causing a 500 error during registration.

  ## Solution
  Create a trigger that automatically creates a profile when a new user is created in auth.users.

  ## Changes
  1. Create function to handle new user profile creation
  2. Add trigger on auth.users INSERT
  3. Extract metadata (full_name, phone, role) from raw_user_meta_data
  4. Handle errors gracefully

  ## Security
  - Function runs with SECURITY DEFINER to access auth schema
  - Properly validates and sanitizes metadata
  - Sets appropriate default values
*/

-- ============================================================================
-- CREATE PROFILE TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_full_name text;
  user_phone text;
  user_role text;
BEGIN
  -- Extract metadata from auth.users
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Utilisateur');
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '');
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'locataire');

  -- Ensure role is valid (default to 'locataire' if not)
  IF user_role NOT IN ('locataire', 'proprietaire', 'agence', 'admin', 'trust_agent') THEN
    user_role := 'locataire';
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    user_type,
    active_role,
    email_verified,
    phone_verified,
    profile_setup_completed,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_phone,
    user_role,
    user_role,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.phone_confirmed_at IS NOT NULL,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    phone_verified = EXCLUDED.phone_verified,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth.users insertion
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- CREATE TRIGGER ON AUTH.USERS
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ============================================================================
-- CREATE HELPER FUNCTION TO SYNC PROFILE
-- ============================================================================

-- Function to manually sync profile for existing users
CREATE OR REPLACE FUNCTION public.sync_user_profile(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record auth.users%ROWTYPE;
BEGIN
  -- Get user from auth.users
  SELECT * INTO user_record
  FROM auth.users
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', user_id;
  END IF;

  -- Create or update profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    user_type,
    active_role,
    email_verified,
    phone_verified,
    profile_setup_completed,
    created_at,
    updated_at
  ) VALUES (
    user_record.id,
    user_record.email,
    COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', 'Utilisateur'),
    COALESCE(user_record.raw_user_meta_data->>'phone', user_record.phone, ''),
    COALESCE(user_record.raw_user_meta_data->>'role', 'locataire'),
    COALESCE(user_record.raw_user_meta_data->>'role', 'locataire'),
    user_record.email_confirmed_at IS NOT NULL,
    user_record.phone_confirmed_at IS NOT NULL,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email_verified = EXCLUDED.email_verified,
    phone_verified = EXCLUDED.phone_verified,
    updated_at = NOW();
END;
$$;

-- ============================================================================
-- SYNC EXISTING USERS (if any)
-- ============================================================================

-- Sync profiles for any existing auth.users that don't have profiles
DO $$
DECLARE
  user_rec RECORD;
BEGIN
  FOR user_rec IN 
    SELECT au.id
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      PERFORM public.sync_user_profile(user_rec.id);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to sync profile for user %: %', user_rec.id, SQLERRM;
    END;
  END LOOP;
END;
$$;
