/*
  # Comprehensive Fix: User Type Enum and All Critical Corrections
  
  This migration:
  1. Drops policies that depend on user_type
  2. Fixes user_type enum (admin_ansut → admin)
  3. Recreates policies
  4. Adds all missing columns and tables
  5. Applies all critical corrections
*/

-- ============================================================================
-- 1. DROP POLICIES THAT DEPEND ON user_type
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all newsletter subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- ============================================================================
-- 2. FIX user_type ENUM
-- ============================================================================

-- Create new enum
CREATE TYPE user_type_new AS ENUM ('locataire', 'proprietaire', 'agence', 'admin');

-- Update column
ALTER TABLE profiles ALTER COLUMN user_type DROP DEFAULT;

ALTER TABLE profiles 
  ALTER COLUMN user_type TYPE user_type_new 
  USING (
    CASE 
      WHEN user_type::text = 'admin_ansut' THEN 'admin'::user_type_new
      ELSE user_type::text::user_type_new
    END
  );

ALTER TABLE profiles ALTER COLUMN user_type SET DEFAULT 'locataire'::user_type_new;

-- Drop old and rename
DROP TYPE user_type;
ALTER TYPE user_type_new RENAME TO user_type;

-- ============================================================================
-- 3. RECREATE POLICIES
-- ============================================================================

CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- 4. ADD MISSING COLUMNS TO PROFILES
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_role TEXT DEFAULT 'locataire';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available_roles TEXT[] DEFAULT ARRAY['locataire'];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_setup_completed BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.active_role IS 'Current active role';
COMMENT ON COLUMN profiles.available_roles IS 'All available roles for multi-role users';
COMMENT ON COLUMN profiles.address IS 'Full postal address';
COMMENT ON COLUMN profiles.profile_setup_completed IS 'Profile setup completion status';

-- ============================================================================
-- 5. CREATE user_verifications TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Overall identity verification
  identity_verified BOOLEAN DEFAULT false,
  identity_verified_at TIMESTAMPTZ,
  
  -- ONECI CNI verification
  oneci_verified BOOLEAN DEFAULT false,
  oneci_verified_at TIMESTAMPTZ,
  oneci_cni_number TEXT,
  oneci_reference_number TEXT,
  
  -- CNAM verification  
  cnam_verified BOOLEAN DEFAULT false,
  cnam_verified_at TIMESTAMPTZ,
  cnam_number TEXT,
  
  -- Biometric face verification
  face_verified BOOLEAN DEFAULT false,
  face_verified_at TIMESTAMPTZ,
  face_verification_provider TEXT,
  face_verification_reference TEXT,
  
  verification_score INTEGER DEFAULT 0,
  verification_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE user_verifications IS 'Identity verifications (ONECI + biometric)';
COMMENT ON COLUMN user_verifications.identity_verified IS 'Overall verification (ONECI + biometric complete)';

CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_identity_verified ON user_verifications(identity_verified);

ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own verification"
  ON user_verifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins view all verifications"
  ON user_verifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- 6. CREATE leases TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES profiles(id) NOT NULL,
  landlord_id UUID REFERENCES profiles(id) NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC(10, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2) DEFAULT 0,
  charges_amount NUMERIC(10, 2) DEFAULT 0,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'expired', 'terminated', 'cancelled')),
  lease_type TEXT DEFAULT 'longue_duree' CHECK (lease_type IN ('courte_duree', 'longue_duree')),
  
  terms TEXT,
  custom_clauses TEXT,
  
  -- Electronic signatures
  electronically_signed BOOLEAN DEFAULT false,
  tenant_signed BOOLEAN DEFAULT false,
  landlord_signed BOOLEAN DEFAULT false,
  tenant_signed_at TIMESTAMPTZ,
  landlord_signed_at TIMESTAMPTZ,
  tenant_otp_verified_at TIMESTAMPTZ,
  landlord_otp_verified_at TIMESTAMPTZ,
  signed_date TIMESTAMPTZ,
  
  -- Optional CEV ONECI (5000 FCFA)
  oneci_cev_requested BOOLEAN DEFAULT false,
  oneci_cev_number TEXT,
  oneci_cev_fee_paid BOOLEAN DEFAULT false,
  oneci_cev_fee_amount NUMERIC(10, 2) DEFAULT 5000.00,
  oneci_cev_issued_at TIMESTAMPTZ,
  
  -- Electronic stamp
  electronic_stamp_number TEXT,
  electronic_stamp_applied_at TIMESTAMPTZ,
  
  -- Signature provider
  signature_provider TEXT DEFAULT 'cryptoneo',
  signature_certificate_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE leases IS 'Rental contracts';
COMMENT ON COLUMN leases.oneci_cev_number IS 'Optional ONECI CEV certificate (5000 FCFA)';
COMMENT ON COLUMN leases.electronic_stamp_number IS 'Visible electronic stamp';
COMMENT ON COLUMN leases.signature_provider IS 'E-signature provider (CryptoNeo)';

CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_landlord_id ON leases(landlord_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_leases_oneci_cev ON leases(oneci_cev_number) WHERE oneci_cev_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leases_stamp ON leases(electronic_stamp_number) WHERE electronic_stamp_number IS NOT NULL;

ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords view leases" ON leases FOR SELECT TO authenticated USING (landlord_id = auth.uid());
CREATE POLICY "Tenants view leases" ON leases FOR SELECT TO authenticated USING (tenant_id = auth.uid());
CREATE POLICY "Landlords create leases" ON leases FOR INSERT TO authenticated WITH CHECK (landlord_id = auth.uid());
CREATE POLICY "Landlords update leases" ON leases FOR UPDATE TO authenticated USING (landlord_id = auth.uid());
CREATE POLICY "Tenants update leases" ON leases FOR UPDATE TO authenticated USING (tenant_id = auth.uid());

-- ============================================================================
-- 7. CREATE rental_applications TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS rental_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES profiles(id) NOT NULL,
  
  status TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'acceptee', 'refusee', 'annulee')),
  message TEXT,
  
  identity_verified_required BOOLEAN DEFAULT true,
  identity_verified_at_application BOOLEAN DEFAULT false,
  
  documents JSONB DEFAULT '[]',
  landlord_response TEXT,
  responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE rental_applications IS 'Rental applications (verification required)';

CREATE INDEX IF NOT EXISTS idx_rental_app_property ON rental_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_app_tenant ON rental_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rental_app_status ON rental_applications(status);

ALTER TABLE rental_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants view applications" ON rental_applications FOR SELECT TO authenticated USING (tenant_id = auth.uid());
CREATE POLICY "Owners view applications" ON rental_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = rental_applications.property_id AND properties.owner_id = auth.uid()));
CREATE POLICY "Tenants create applications" ON rental_applications FOR INSERT TO authenticated WITH CHECK (tenant_id = auth.uid());
CREATE POLICY "Owners update applications" ON rental_applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = rental_applications.property_id AND properties.owner_id = auth.uid()));

-- ============================================================================
-- 8. ADD property_category
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_category') THEN
    CREATE TYPE property_category AS ENUM ('residentiel', 'commercial');
  END IF;
END $$;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_category property_category DEFAULT 'residentiel';

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS upd_profiles ON profiles;
CREATE TRIGGER upd_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS upd_user_verifications ON user_verifications;
CREATE TRIGGER upd_user_verifications BEFORE UPDATE ON user_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS upd_leases ON leases;
CREATE TRIGGER upd_leases BEFORE UPDATE ON leases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS upd_rental_applications ON rental_applications;
CREATE TRIGGER upd_rental_applications BEFORE UPDATE ON rental_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Check all critical columns exist
  SELECT COUNT(*) INTO v_count FROM information_schema.columns 
  WHERE (table_name = 'user_verifications' AND column_name = 'identity_verified')
     OR (table_name = 'leases' AND column_name = 'oneci_cev_number')
     OR (table_name = 'leases' AND column_name = 'electronic_stamp_number')
     OR (table_name = 'profiles' AND column_name = 'address');
  
  IF v_count < 4 THEN
    RAISE EXCEPTION 'Critical columns missing! Found % of 4', v_count;
  END IF;

  RAISE NOTICE '✅ ALL CRITICAL CORRECTIONS APPLIED SUCCESSFULLY!';
  RAISE NOTICE '✅ user_type enum: admin_ansut → admin';
  RAISE NOTICE '✅ user_verifications: identity_verified column';
  RAISE NOTICE '✅ leases: CEV ONECI + electronic stamp fields';
  RAISE NOTICE '✅ profiles: address + multi-role columns';
  RAISE NOTICE '✅ rental_applications: verification required';
END $$;
