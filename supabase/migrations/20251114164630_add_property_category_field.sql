/*
  # Add Property Category Classification

  ## Description
  This migration adds a property_category field to distinguish between residential 
  and commercial properties, improving search precision and user experience.

  ## Changes Made
  1. New Columns
    - `property_category` (text) - Categories: 'residentiel' or 'commercial'
      - Default: 'residentiel' (most properties are residential)
      - NOT NULL with constraint check

  2. Data Migration
    - Automatically categorize existing properties based on their property_type
    - Residential: appartement, maison, studio, villa, duplex, chambre
    - Commercial: bureau, commerce

  3. Constraints
    - Check constraint to ensure only valid categories
    - Index on property_category for efficient filtering

  ## Impact
  - Enables proper separation of residential and commercial listings
  - Improves search filtering and user experience
  - Maintains backward compatibility with existing data
*/

-- Add property_category column with default value
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_category TEXT NOT NULL DEFAULT 'residentiel';

-- Add check constraint for valid categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'properties_category_check'
  ) THEN
    ALTER TABLE properties 
    ADD CONSTRAINT properties_category_check 
    CHECK (property_category IN ('residentiel', 'commercial'));
  END IF;
END $$;

-- Migrate existing data: categorize based on property_type
UPDATE properties
SET property_category = CASE
  WHEN property_type IN ('bureau', 'commerce') THEN 'commercial'
  ELSE 'residentiel'
END
WHERE property_category = 'residentiel';

-- Create index for efficient filtering by category
CREATE INDEX IF NOT EXISTS idx_properties_category 
ON properties(property_category);

-- Create composite index for common searches (category + status)
CREATE INDEX IF NOT EXISTS idx_properties_category_status 
ON properties(property_category, status);

-- Add comment to document the field
COMMENT ON COLUMN properties.property_category IS 
'Property category: residentiel (apartments, houses, etc.) or commercial (offices, warehouses, etc.)';
