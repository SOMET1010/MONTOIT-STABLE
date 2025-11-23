/*
  # Create OTP Codes Table

  1. New Tables
    - `otp_codes`
      - `id` (uuid, primary key)
      - `phone` (text, indexed)
      - `code` (text, OTP code)
      - `expires_at` (timestamptz)
      - `attempts` (integer, failed verification attempts)
      - `verified` (boolean, if code was used)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `otp_codes` table
    - Only admin/service can read/write
    - Auto-delete expired codes after 1 hour

  3. Indexes
    - Index on phone for fast lookup
    - Index on expires_at for cleanup
*/

-- Create otp_codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_verified ON otp_codes(verified);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Policies: Only service role can access
-- No public access for security

-- Function to clean expired OTP codes
CREATE OR REPLACE FUNCTION clean_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < now() - interval '1 hour';
END;
$$;

-- Create a scheduled job to clean up expired codes (if pg_cron is available)
-- This can also be called from an edge function periodically
COMMENT ON FUNCTION clean_expired_otp_codes() IS 'Deletes OTP codes that expired more than 1 hour ago';
