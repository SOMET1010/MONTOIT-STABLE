/*
  # Create Facial Verification System with NeoFace V2

  ## Description
  Complete facial verification system with NeoFace V2 as primary provider

  ## Changes Made
  1. Tables Created
    - facial_verifications: Store facial verification attempts and results
    - service_configurations: Manage provider priorities and costs

  2. Provider Configuration
    - NeoFace V2: Priority 1 (FREE)
    - Smileless: Priority 2 (FREE fallback)
    - Azure Face: Priority 3 (Paid fallback)

  3. Functions Created
    - log_facial_verification_attempt: Log verification attempts
    - update_facial_verification_status: Update verification status
    - get_facial_verification_stats: Get provider statistics
    - get_active_facial_provider: Get highest priority active provider

  4. Security
    - Row Level Security enabled on all tables
    - Proper indexes for performance
    - User-specific data access only
*/

-- Create facial_verifications table
CREATE TABLE IF NOT EXISTS facial_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('neoface', 'smileless', 'azure', 'smile_id')),
  document_id text,
  selfie_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
  matching_score numeric CHECK (matching_score >= 0 AND matching_score <= 1),
  is_match boolean,
  is_live boolean,
  failure_reason text,
  verification_attempts integer DEFAULT 1,
  provider_response jsonb,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_configurations table
CREATE TABLE IF NOT EXISTS service_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  provider text NOT NULL,
  priority integer NOT NULL DEFAULT 99,
  is_enabled boolean DEFAULT true,
  configuration jsonb DEFAULT '{}',
  cost_per_1k numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(service_name, provider)
);

-- Create service_usage_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS service_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  provider text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failure')),
  error_message text,
  response_time_ms integer,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_facial_verifications_user_id ON facial_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_facial_verifications_provider ON facial_verifications(provider);
CREATE INDEX IF NOT EXISTS idx_facial_verifications_status ON facial_verifications(status);
CREATE INDEX IF NOT EXISTS idx_service_configurations_priority ON service_configurations(service_name, priority) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_service_usage_logs_provider ON service_usage_logs(service_name, provider, timestamp);

-- Enable RLS
ALTER TABLE facial_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for facial_verifications
CREATE POLICY "Users can view own facial verifications"
  ON facial_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own facial verifications"
  ON facial_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update facial verifications"
  ON facial_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for service_configurations
CREATE POLICY "Service configurations are viewable by authenticated users"
  ON service_configurations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service configurations are manageable by admins"
  ON service_configurations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin_ansut'
    )
  );

-- RLS Policies for service_usage_logs
CREATE POLICY "Service logs are viewable by admins"
  ON service_usage_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin_ansut'
    )
  );

-- Configure NeoFace V2 as primary provider
INSERT INTO service_configurations (service_name, provider, priority, is_enabled, cost_per_1k, configuration)
VALUES
  ('face_recognition', 'neoface', 1, true, 0, '{"api_version": "v2", "description": "NeoFace V2 - Reconnaissance faciale gratuite", "api_base": "https://neoface.aineo.ai/api/v2"}'),
  ('face_recognition', 'smileless', 2, true, 0, '{"description": "Smileless - Fallback gratuit", "api_base": "https://neoface.aineo.ai/api"}'),
  ('face_recognition', 'azure', 3, true, 750, '{"description": "Azure Face API - Fallback payant"}')
ON CONFLICT (service_name, provider)
DO UPDATE SET
  priority = EXCLUDED.priority,
  is_enabled = EXCLUDED.is_enabled,
  cost_per_1k = EXCLUDED.cost_per_1k,
  configuration = EXCLUDED.configuration,
  updated_at = now();

-- Function: Get active facial verification provider
CREATE OR REPLACE FUNCTION get_active_facial_provider()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_provider text;
BEGIN
  SELECT provider INTO active_provider
  FROM service_configurations
  WHERE service_name = 'face_recognition'
    AND is_enabled = true
  ORDER BY priority ASC
  LIMIT 1;

  RETURN COALESCE(active_provider, 'neoface');
END;
$$;

-- Function: Log facial verification attempt
CREATE OR REPLACE FUNCTION log_facial_verification_attempt(
  p_user_id uuid,
  p_provider text,
  p_document_id text DEFAULT NULL,
  p_selfie_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_verification_id uuid;
BEGIN
  INSERT INTO facial_verifications (
    user_id,
    provider,
    document_id,
    selfie_url,
    status,
    verification_attempts,
    created_at
  )
  VALUES (
    p_user_id,
    p_provider,
    p_document_id,
    p_selfie_url,
    'pending',
    1,
    now()
  )
  RETURNING id INTO v_verification_id;

  RETURN v_verification_id;
END;
$$;

-- Function: Update facial verification status
CREATE OR REPLACE FUNCTION update_facial_verification_status(
  p_verification_id uuid,
  p_status text,
  p_matching_score numeric DEFAULT NULL,
  p_provider_response jsonb DEFAULT NULL,
  p_is_match boolean DEFAULT NULL,
  p_is_live boolean DEFAULT NULL,
  p_failure_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE facial_verifications
  SET
    status = p_status,
    matching_score = COALESCE(p_matching_score, matching_score),
    provider_response = COALESCE(p_provider_response, provider_response),
    is_match = COALESCE(p_is_match, is_match),
    is_live = COALESCE(p_is_live, is_live),
    failure_reason = COALESCE(p_failure_reason, failure_reason),
    verified_at = CASE WHEN p_status = 'passed' THEN now() ELSE verified_at END,
    updated_at = now()
  WHERE id = p_verification_id;
END;
$$;

-- Function: Get facial verification statistics
CREATE OR REPLACE FUNCTION get_facial_verification_stats(
  p_period interval DEFAULT '30 days'
)
RETURNS TABLE (
  provider text,
  total_verifications bigint,
  successful_verifications bigint,
  failed_verifications bigint,
  success_rate numeric,
  avg_matching_score numeric,
  estimated_cost numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fv.provider,
    COUNT(*) as total_verifications,
    COUNT(*) FILTER (WHERE fv.status = 'passed') as successful_verifications,
    COUNT(*) FILTER (WHERE fv.status = 'failed') as failed_verifications,
    ROUND(
      (COUNT(*) FILTER (WHERE fv.status = 'passed')::numeric / NULLIF(COUNT(*), 0) * 100),
      2
    ) as success_rate,
    ROUND(AVG(fv.matching_score), 4) as avg_matching_score,
    ROUND(
      (COUNT(*) / 1000.0) * COALESCE(sc.cost_per_1k, 0),
      2
    ) as estimated_cost
  FROM facial_verifications fv
  LEFT JOIN service_configurations sc
    ON sc.service_name = 'face_recognition'
    AND sc.provider = fv.provider
  WHERE fv.created_at >= (now() - p_period)
  GROUP BY fv.provider, sc.cost_per_1k
  ORDER BY
    CASE fv.provider
      WHEN 'neoface' THEN 1
      WHEN 'smileless' THEN 2
      WHEN 'azure' THEN 3
      ELSE 99
    END;
END;
$$;

-- Add comments
COMMENT ON TABLE facial_verifications IS 'Historique des vérifications faciales avec NeoFace V2, Smileless et Azure Face';
COMMENT ON TABLE service_configurations IS 'Configuration des providers de services avec priorités et coûts';
COMMENT ON TABLE service_usage_logs IS 'Logs d''utilisation des services externes';
COMMENT ON FUNCTION get_active_facial_provider() IS 'Retourne le provider de reconnaissance faciale actif avec la plus haute priorité';
COMMENT ON FUNCTION log_facial_verification_attempt(uuid, text, text, text) IS 'Enregistre une tentative de vérification faciale';
COMMENT ON FUNCTION update_facial_verification_status(uuid, text, numeric, jsonb, boolean, boolean, text) IS 'Met à jour le statut d''une vérification faciale';
COMMENT ON FUNCTION get_facial_verification_stats(interval) IS 'Retourne les statistiques de vérification faciale par provider';
