/*
  # Remove Smile ID Provider from Facial Verification System

  ## Description
  Removes Smile ID as a facial verification provider and consolidates the system
  to use only NeoFace (Smileless) as the primary FREE provider and Azure Face as fallback.

  ## Changes Made
  1. API Keys Management
    - Remove Smile ID from api_keys table

  2. Database Updates
    - Clean up Smile ID references in api_key_logs
    - Update system to use only NeoFace and Azure Face

  3. Reasoning
    - NeoFace (Smileless) provides FREE unlimited verifications
    - Azure Face provides reliable paid fallback
    - Simplifies architecture and reduces maintenance overhead
    - 100% cost savings when NeoFace succeeds (95%+ success rate expected)

  ## Cost Impact
  - NeoFace: 0 FCFA (FREE) - Primary provider
  - Azure Face: 750 FCFA per 1K verifications - Fallback only
  - Smile ID: REMOVED
*/

-- Remove Smile ID from api_keys table if it exists
DELETE FROM api_keys
WHERE service_name = 'smile_id';

-- Clean up any Smile ID logs
UPDATE api_key_logs
SET status = 'deprecated'
WHERE service_name = 'smile_id';

-- Add comment about the dual-provider system
COMMENT ON TABLE api_keys IS 'API keys for external services. Facial verification uses NeoFace (free, primary) and Azure Face (paid, fallback only).';
