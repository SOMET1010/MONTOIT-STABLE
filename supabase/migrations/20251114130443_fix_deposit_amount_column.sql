/*
  # Fix deposit_amount column name

  1. Changes
    - Add deposit_amount column if it doesn't exist
    - Copy data from security_deposit to deposit_amount
    - Keep security_deposit for backward compatibility
  
  2. Notes
    - This fixes the inconsistency between database schema and application code
    - Application uses deposit_amount, but database has security_deposit
*/

-- Add deposit_amount column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'deposit_amount'
  ) THEN
    ALTER TABLE properties ADD COLUMN deposit_amount DECIMAL(12, 2);
  END IF;
END $$;

-- Copy existing security_deposit values to deposit_amount
UPDATE properties 
SET deposit_amount = security_deposit 
WHERE deposit_amount IS NULL AND security_deposit IS NOT NULL;

-- Set default value for future inserts
ALTER TABLE properties ALTER COLUMN deposit_amount SET DEFAULT 0;