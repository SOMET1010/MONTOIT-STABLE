/*
  # Add NeoFace Support Functions and Tables
  
  This migration adds:
  1. Service usage logs table for tracking API calls
  2. Facial verification attempts table for detailed tracking
  3. PostgreSQL functions for logging and updating verification status
  4. Indexes for performance
  
  These support the NeoFace facial verification integration.
*/

-- ============================================================================
-- 1. CREATE service_usage_logs TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'pending')),
  error_message TEXT,
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE service_usage_logs IS 'Logs all external service API calls for monitoring';
COMMENT ON COLUMN service_usage_logs.service_name IS 'Type of service (face_recognition, sms, etc)';
COMMENT ON COLUMN service_usage_logs.provider IS 'Provider name (neoface, smileless, azure, etc)';

CREATE INDEX IF NOT EXISTS idx_service_usage_logs_service ON service_usage_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_service_usage_logs_provider ON service_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_service_usage_logs_timestamp ON service_usage_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_service_usage_logs_status ON service_usage_logs(status);

ALTER TABLE service_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view service logs"
  ON service_usage_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- 2. CREATE facial_verification_attempts TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS facial_verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  document_id TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
  matching_score NUMERIC(5, 2),
  is_match BOOLEAN,
  is_live BOOLEAN,
  provider_response JSONB,
  failure_reason TEXT,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE facial_verification_attempts IS 'Tracks all facial verification attempts for audit trail';
COMMENT ON COLUMN facial_verification_attempts.provider IS 'Verification provider (neoface, smileless, azure)';
COMMENT ON COLUMN facial_verification_attempts.matching_score IS 'Face matching confidence score (0-100)';
COMMENT ON COLUMN facial_verification_attempts.is_live IS 'Liveness detection result';

CREATE INDEX IF NOT EXISTS idx_facial_attempts_user ON facial_verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_facial_attempts_provider ON facial_verification_attempts(provider);
CREATE INDEX IF NOT EXISTS idx_facial_attempts_status ON facial_verification_attempts(status);
CREATE INDEX IF NOT EXISTS idx_facial_attempts_created ON facial_verification_attempts(created_at DESC);

ALTER TABLE facial_verification_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own attempts"
  ON facial_verification_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins view all attempts"
  ON facial_verification_attempts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- 3. FUNCTION: log_facial_verification_attempt
-- ============================================================================

CREATE OR REPLACE FUNCTION log_facial_verification_attempt(
  p_user_id UUID,
  p_provider TEXT,
  p_document_id TEXT,
  p_selfie_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_verification_id UUID;
  v_attempt_number INTEGER;
BEGIN
  -- Get next attempt number for this user
  SELECT COALESCE(MAX(attempt_number), 0) + 1
  INTO v_attempt_number
  FROM facial_verification_attempts
  WHERE user_id = p_user_id;

  -- Insert new verification attempt
  INSERT INTO facial_verification_attempts (
    user_id,
    provider,
    document_id,
    selfie_url,
    status,
    attempt_number
  )
  VALUES (
    p_user_id,
    p_provider,
    p_document_id,
    p_selfie_url,
    'pending',
    v_attempt_number
  )
  RETURNING id INTO v_verification_id;

  RETURN v_verification_id;
END;
$$;

COMMENT ON FUNCTION log_facial_verification_attempt IS 'Logs a new facial verification attempt';

-- ============================================================================
-- 4. FUNCTION: update_facial_verification_status
-- ============================================================================

CREATE OR REPLACE FUNCTION update_facial_verification_status(
  p_verification_id UUID,
  p_status TEXT,
  p_matching_score NUMERIC DEFAULT NULL,
  p_provider_response JSONB DEFAULT NULL,
  p_is_match BOOLEAN DEFAULT NULL,
  p_is_live BOOLEAN DEFAULT NULL,
  p_failure_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_provider TEXT;
BEGIN
  -- Update the verification attempt
  UPDATE facial_verification_attempts
  SET 
    status = p_status,
    matching_score = COALESCE(p_matching_score, matching_score),
    provider_response = COALESCE(p_provider_response, provider_response),
    is_match = COALESCE(p_is_match, is_match),
    is_live = COALESCE(p_is_live, is_live),
    failure_reason = p_failure_reason,
    updated_at = now()
  WHERE id = p_verification_id
  RETURNING user_id, provider INTO v_user_id, v_provider;

  -- If verification passed, update user_verifications
  IF p_status = 'passed' AND v_user_id IS NOT NULL THEN
    -- Update user_verifications table
    UPDATE user_verifications
    SET 
      face_verified = true,
      face_verified_at = now(),
      face_verification_provider = v_provider,
      face_verification_reference = p_verification_id::TEXT,
      updated_at = now()
    WHERE user_id = v_user_id;

    -- Check if both ONECI and face are verified, then set identity_verified
    UPDATE user_verifications
    SET 
      identity_verified = true,
      identity_verified_at = now(),
      updated_at = now()
    WHERE user_id = v_user_id
      AND oneci_verified = true
      AND face_verified = true
      AND identity_verified = false;
  END IF;
END;
$$;

COMMENT ON FUNCTION update_facial_verification_status IS 'Updates facial verification status and syncs with user_verifications';

-- ============================================================================
-- 5. TRIGGER FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_facial_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_facial_attempts_updated_at ON facial_verification_attempts;
CREATE TRIGGER trigger_facial_attempts_updated_at
  BEFORE UPDATE ON facial_verification_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_facial_attempts_updated_at();

-- ============================================================================
-- 6. VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Check tables exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_usage_logs') THEN
    RAISE EXCEPTION 'service_usage_logs table missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'facial_verification_attempts') THEN
    RAISE EXCEPTION 'facial_verification_attempts table missing';
  END IF;

  -- Check functions exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_facial_verification_attempt') THEN
    RAISE EXCEPTION 'log_facial_verification_attempt function missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_facial_verification_status') THEN
    RAISE EXCEPTION 'update_facial_verification_status function missing';
  END IF;

  RAISE NOTICE '✅ NeoFace support functions and tables created successfully!';
  RAISE NOTICE '✅ service_usage_logs: API call tracking';
  RAISE NOTICE '✅ facial_verification_attempts: Verification audit trail';
  RAISE NOTICE '✅ Functions: log_facial_verification_attempt, update_facial_verification_status';
END $$;
