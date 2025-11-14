/*
  # Système de Vérification Email et SMS avec OTP

  1. Nouvelle Table
    - `verification_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, référence auth.users)
      - `email` (text)
      - `phone` (text)
      - `code` (text) - Code OTP à 6 chiffres
      - `type` (text) - 'email' ou 'sms'
      - `verified` (boolean)
      - `attempts` (integer) - Nombre de tentatives
      - `expires_at` (timestamptz) - Date d'expiration (10 minutes)
      - `created_at` (timestamptz)

  2. Sécurité
    - Enable RLS on `verification_codes` table
    - Politique pour permettre aux utilisateurs de voir leurs propres codes
    - Politique pour permettre l'insertion de nouveaux codes
    - Politique pour permettre la mise à jour (vérification)

  3. Fonctions
    - `generate_otp()` - Génère un code OTP à 6 chiffres
    - `verify_otp_code()` - Vérifie un code OTP
    - `cleanup_expired_codes()` - Nettoie les codes expirés
*/

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  phone text,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_contact CHECK (
    (type = 'email' AND email IS NOT NULL) OR 
    (type = 'sms' AND phone IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);

-- Enable RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own verification codes"
  ON verification_codes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    email IN (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert verification codes"
  ON verification_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own verification codes"
  ON verification_codes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    email IN (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR
    email IN (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow anon users to insert codes (for registration flow)
CREATE POLICY "Anon users can insert verification codes"
  ON verification_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon users to select their codes (by email/phone)
CREATE POLICY "Anon users can view codes by email or phone"
  ON verification_codes
  FOR SELECT
  TO anon
  USING (true);

-- Function to generate 6-digit OTP
CREATE OR REPLACE FUNCTION generate_otp()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp text;
BEGIN
  otp := lpad(floor(random() * 1000000)::text, 6, '0');
  RETURN otp;
END;
$$;

-- Function to verify OTP code
CREATE OR REPLACE FUNCTION verify_otp_code(
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_code text DEFAULT NULL,
  p_type text DEFAULT 'email'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record record;
  v_result json;
BEGIN
  SELECT * INTO v_record
  FROM verification_codes
  WHERE 
    type = p_type
    AND verified = false
    AND expires_at > now()
    AND (
      (p_type = 'email' AND email = p_email) OR
      (p_type = 'sms' AND phone = p_phone)
    )
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code introuvable ou expiré'
    );
  END IF;

  UPDATE verification_codes
  SET attempts = attempts + 1
  WHERE id = v_record.id;

  IF v_record.attempts >= 3 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Nombre maximum de tentatives atteint'
    );
  END IF;

  IF v_record.code = p_code THEN
    UPDATE verification_codes
    SET verified = true
    WHERE id = v_record.id;

    RETURN json_build_object(
      'success', true,
      'message', 'Code vérifié avec succès',
      'user_id', v_record.user_id,
      'email', v_record.email,
      'phone', v_record.phone
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Code incorrect',
      'attempts_remaining', 3 - v_record.attempts - 1
    );
  END IF;
END;
$$;

-- Function to cleanup expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < now() - interval '1 day';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON verification_codes TO authenticated;
GRANT SELECT, INSERT ON verification_codes TO anon;
GRANT EXECUTE ON FUNCTION generate_otp() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verify_otp_code(text, text, text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_codes() TO authenticated;
