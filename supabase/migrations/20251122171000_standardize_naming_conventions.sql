/*
  # Standardize Naming Conventions - Phase 2 (Standardizations)

  ## Description
  Establishes consistent naming conventions across the database:
  1. Standardizes table prefixes by functional modules
  2. Creates module-based view organization
  3. Establishes consistent naming patterns
  4. Adds comprehensive documentation

  ## Convention Standards:
  - user_*: User-related tables
  - property_*: Property-related tables
  - lease_*: Lease and contract tables
  - payment_*: Payment and transaction tables
  - notification_*: Communication tables
  - verification_*: Verification and KYC tables
  - admin_*: Administrative and system tables
  - audit_*: Logging and audit tables

  ## Changes
  - Create module-based organization views
  - Add comprehensive table documentation
  - Create helper functions for common patterns
  - Add consistent index naming

  ## Safety
  - All changes are additive
  - Uses views for organization, no table renames
  - Backward compatible with existing code
  - Performance improved through better indexing
*/

-- ============================================================================
-- STEP 1: Create module-based organization views
-- ============================================================================

-- User Management Module View
CREATE OR REPLACE VIEW user_management_module AS
SELECT
  'profiles' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM profiles

UNION ALL

SELECT
  'user_verifications' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM user_verifications

UNION ALL

SELECT
  'user_roles' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM user_roles;

-- Property Management Module View
CREATE OR REPLACE VIEW property_management_module AS
SELECT
  'properties' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM properties

UNION ALL

SELECT
  'property_images' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM property_images

UNION ALL

SELECT
  'property_documents' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM property_documents;

-- Lease Management Module View
CREATE OR REPLACE VIEW lease_management_module AS
SELECT
  'leases' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM leases

UNION ALL

SELECT
  'rental_applications' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM rental_applications

UNION ALL

SELECT
  'visits' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM visits;

-- Payment Management Module View
CREATE OR REPLACE VIEW payment_management_module AS
SELECT
  'payments' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM payments

UNION ALL

SELECT
  'mobile_money_transactions' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM mobile_money_transactions

UNION ALL

SELECT
  'transactions' as table_name,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM transactions;

-- ============================================================================
-- STEP 2: Create comprehensive table documentation
-- ============================================================================

-- Create extended information schema view
CREATE OR REPLACE VIEW table_documentation AS
SELECT
    t.table_schema,
    t.table_name,
    t.table_type,
    obj_description(c.oid) as table_comment,
    COALESCE(
      CASE
        WHEN t.table_name LIKE 'user_%' THEN 'User Management Module'
        WHEN t.table_name LIKE 'property_%' THEN 'Property Management Module'
        WHEN t.table_name LIKE 'lease_%' THEN 'Lease Management Module'
        WHEN t.table_name LIKE 'payment_%' THEN 'Payment Management Module'
        WHEN t.table_name LIKE 'notification_%' THEN 'Communication Module'
        WHEN t.table_name LIKE 'verification_%' THEN 'Verification Module'
        WHEN t.table_name LIKE 'admin_%' THEN 'Administration Module'
        WHEN t.table_name LIKE 'audit_%' THEN 'Audit Module'
        ELSE 'Other Module'
      END,
      'Uncategorized'
    ) as functional_module,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = t.table_name) as constraint_count,
    (SELECT COUNT(*) FROM information_schema.views WHERE table_name = t.table_name) as view_count
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY functional_module, t.table_name;

-- ============================================================================
-- STEP 3: Standardize index naming conventions
-- ============================================================================

-- Function to generate standardized index names
CREATE OR REPLACE FUNCTION generate_standard_index_name(
    table_name text,
    column_names text[],
    index_type text DEFAULT 'btree'
) RETURNS text AS $$
DECLARE
    result text;
    column_string text;
BEGIN
    -- Convert array to underscore-separated string
    SELECT array_to_string(column_names, '_') INTO column_string;

    -- Generate standardized name: idx_tablename_columns
    result := 'idx_' || table_name || '_' || column_string;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add standardized indexes for key tables following the convention
-- User management indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type_created ON profiles(user_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(is_verified, oneci_verified, cnam_verified);
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_score ON user_verifications(user_id, tenant_score DESC);

-- Property management indexes
CREATE INDEX IF NOT EXISTS idx_properties_status_type ON properties(property_status, property_type);
CREATE INDEX IF NOT EXISTS idx_properties_owner_created ON properties(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_location_coords ON properties USING GIST(ST_MakePoint(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_property_images_property_primary ON property_images(property_id, is_primary);

-- Lease management indexes
CREATE INDEX IF NOT EXISTS idx_leases_status_dates ON leases(lease_status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rental_applications_property_status ON rental_applications(property_id, application_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_property_status_dates ON visits(property_id, visit_status, scheduled_date);

-- Payment management indexes
CREATE INDEX IF NOT EXISTS idx_payments_status_dates ON payments(payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_type_method ON payments(payment_type, payment_method);
CREATE INDEX IF NOT EXISTS idx_mobile_money_provider_status ON mobile_money_transactions(provider, transaction_status);

-- Verification system indexes
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_status ON identity_verifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_facial_verifications_confidence ON facial_verifications(confidence_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_expires ON verification_codes(user_id, expires_at);

-- Notification system indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_type_created ON notifications(user_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_participants_created ON messages(sender_id, receiver_id, created_at DESC);

-- ============================================================================
-- STEP 4: Create helper functions for common patterns
-- ============================================================================

-- Function to get user with all related data
CREATE OR REPLACE FUNCTION get_user_complete_profile(user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'profile', (
            SELECT row_to_json(profiles.*) FROM profiles WHERE profiles.id = user_uuid
        ),
        'verification', (
            SELECT row_to_json(user_verifications.*)
            FROM user_verifications
            WHERE user_verifications.user_id = user_uuid
        ),
        'role', (
            SELECT row_to_json(user_roles.*)
            FROM user_roles
            WHERE user_roles.user_id = user_uuid
        ),
        'properties', (
            SELECT jsonb_agg(row_to_json(properties.*))
            FROM properties
            WHERE properties.owner_id = user_uuid
        ),
        'active_leases', (
            SELECT jsonb_agg(row_to_json(leases.*))
            FROM leases
            WHERE leases.tenant_id = user_uuid
            AND leases.lease_status = 'actif'
        ),
        'notifications_count', (
            SELECT COUNT(*)
            FROM notifications
            WHERE notifications.user_id = user_uuid
            AND notifications.read = false
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get property with all related data
CREATE OR REPLACE FUNCTION get_property_complete_details(property_uuid uuid)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'property', (
            SELECT row_to_json(properties.*) FROM properties WHERE properties.id = property_uuid
        ),
        'images', (
            SELECT jsonb_agg(row_to_json(property_images.*))
            FROM property_images
            WHERE property_images.property_id = property_uuid
            ORDER BY property_images.is_primary DESC, property_images.display_order
        ),
        'documents', (
            SELECT jsonb_agg(row_to_json(property_documents.*))
            FROM property_documents
            WHERE property_documents.property_id = property_uuid
        ),
        'features', (
            SELECT jsonb_agg(row_to_json(property_features.*))
            FROM property_features
            WHERE property_features.property_id = property_uuid
        ),
        'applications_count', (
            SELECT COUNT(*)
            FROM rental_applications
            WHERE rental_applications.property_id = property_uuid
        ),
        'visits_count', (
            SELECT COUNT(*)
            FROM visits
            WHERE visits.property_id = property_uuid
        ),
        'active_lease', (
            SELECT row_to_json(leases.*)
            FROM leases
            WHERE leases.property_id = property_uuid
            AND leases.lease_status = 'actif'
            LIMIT 1
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to standardize table statistics
CREATE OR REPLACE FUNCTION get_table_statistics(table_pattern text DEFAULT '%')
RETURNS TABLE (
    table_name text,
    record_count bigint,
    size_mb numeric,
    index_count integer,
    last_analyzed timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        schemaname||'.'||tablename as table_name,
        n_tup_ins - n_tup_del as record_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size_mb,
        (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count,
        GREATEST(last_vacuum, last_autovacuum, last_analyze, last_autoanalyze) as last_analyzed
    FROM pg_stat_user_tables t
    WHERE tablename LIKE table_pattern
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: Create naming convention validation function
-- ============================================================================

-- Function to check if table follows naming conventions
CREATE OR REPLACE FUNCTION validate_table_naming(table_name text)
RETURNS jsonb AS $$
DECLARE
    is_valid boolean := true;
    issues text[] := '{}';
    suggested_name text;
    prefix text;
    module text;
BEGIN
    -- Check for standard prefixes
    IF table_name LIKE 'user_%' THEN
        prefix := 'user_';
        module := 'User Management';
    ELSIF table_name LIKE 'property_%' THEN
        prefix := 'property_';
        module := 'Property Management';
    ELSIF table_name LIKE 'lease_%' THEN
        prefix := 'lease_';
        module := 'Lease Management';
    ELSIF table_name LIKE 'payment_%' THEN
        prefix := 'payment_';
        module := 'Payment Management';
    ELSIF table_name LIKE 'notification_%' THEN
        prefix := 'notification_';
        module := 'Communication';
    ELSIF table_name LIKE 'verification_%' THEN
        prefix := 'verification_';
        module := 'Verification';
    ELSIF table_name LIKE 'admin_%' THEN
        prefix := 'admin_';
        module := 'Administration';
    ELSIF table_name LIKE 'audit_%' THEN
        prefix := 'audit_';
        module := 'Audit';
    ELSIF table_name IN ('profiles', 'api_keys', 'messages', 'visits', 'leases', 'properties') THEN
        -- Legacy tables that are acceptable
        module := 'Legacy/Standard';
    ELSE
        is_valid := false;
        issues := array_append(issues, 'Table does not follow standard naming convention');
        suggested_name := 'suggested_prefix_' || table_name;
    END IF;

    -- Check for plural form (most tables should be plural)
    IF table_name NOT IN ('user_verifications', 'identity_verifications') -- Exceptions
       AND RIGHT(table_name, 1) != 's' THEN
        is_valid := false;
        issues := array_append(issues, 'Table name should be in plural form');
        suggested_name := COALESCE(prefix, '') || table_name || 's';
    END IF;

    -- Check for snake_case
    IF table_name != lower(table_name) THEN
        is_valid := false;
        issues := array_append(issues, 'Table name should be in snake_case');
    END IF;

    RETURN jsonb_build_object(
        'table_name', table_name,
        'is_valid', is_valid,
        'module', module,
        'issues', issues,
        'suggested_name', suggested_name
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: Grant permissions and add documentation
-- ============================================================================

-- Grant permissions for new views and functions
GRANT SELECT ON user_management_module TO authenticated;
GRANT SELECT ON property_management_module TO authenticated;
GRANT SELECT ON lease_management_module TO authenticated;
GRANT SELECT ON payment_management_module TO authenticated;
GRANT SELECT ON table_documentation TO authenticated;

-- Grant execute permissions for functions
GRANT EXECUTE ON FUNCTION get_user_complete_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_property_complete_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_statistics(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_table_naming(text) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_standard_index_name(text, text[], text) TO authenticated;

-- Add comprehensive comments
COMMENT ON SCHEMA public IS 'Main schema for Mon Toit platform database with standardized naming conventions';

COMMENT ON VIEW user_management_module IS 'Overview of all user management related tables and their statistics';
COMMENT ON VIEW property_management_module IS 'Overview of property management tables and statistics';
COMMENT ON VIEW lease_management_module IS 'Overview of lease and rental management tables and statistics';
COMMENT ON VIEW payment_management_module IS 'Overview of payment and transaction tables and statistics';
COMMENT ON VIEW table_documentation IS 'Comprehensive documentation of all database tables with module classification';

COMMENT ON FUNCTION get_user_complete_profile(uuid) IS 'Retrieves complete user profile including verifications, properties, and activities';
COMMENT ON FUNCTION get_property_complete_details(uuid) IS 'Retrieves complete property details including images, documents, and active lease information';
COMMENT ON FUNCTION get_table_statistics(text) IS 'Returns comprehensive statistics for tables matching the pattern';
COMMENT ON FUNCTION validate_table_naming(text) IS 'Validates if a table name follows established naming conventions';
COMMENT ON FUNCTION generate_standard_index_name(text, text[], text) IS 'Generates standardized index names following the convention idx_tablename_columns';

-- Document this migration
INSERT INTO migration_documentation (migration_name, migration_version, description, changes_made, impact_assessment) VALUES
(
  'standardize_naming_conventions_phase2',
  '20251122171000',
  'Phase 2: Standardized naming conventions with module-based organization, helper functions, and comprehensive documentation',
  '{
    "module_views": "created 4 module overview views",
    "documentation": "added comprehensive table documentation view",
    "indexes": "added standardized indexes following naming convention",
    "helper_functions": "created 4 helper functions for common patterns",
    "validation": "added naming convention validation function",
    "permissions": "granted appropriate permissions for new objects"
  }'::jsonb,
  'Low impact: All changes are additive and backward compatible. New views and functions improve developer experience and maintainability.'
);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================================';
  RAISE NOTICE 'Migration 20251122171000 completed successfully!';
  RAISE NOTICE 'Standardized naming conventions:';
  RAISE NOTICE '✓ Created module-based organization views';
  RAISE NOTICE '✓ Added comprehensive table documentation';
  RAISE NOTICE '✓ Standardized index naming patterns';
  RAISE NOTICE '✓ Created helper functions for common operations';
  RAISE NOTICE '✓ Added naming convention validation';
  RAISE NOTICE '✓ Documented all changes and functions';
  RAISE NOTICE '';
  RAISE NOTICE 'Naming conventions established:';
  RAISE NOTICE '• user_*: User Management Module';
  RAISE NOTICE '• property_*: Property Management Module';
  RAISE NOTICE '• lease_*: Lease Management Module';
  RAISE NOTICE '• payment_*: Payment Management Module';
  RAISE NOTICE '• notification_*: Communication Module';
  RAISE NOTICE '• verification_*: Verification Module';
  RAISE NOTICE '• admin_*: Administration Module';
  RAISE NOTICE '• audit_*: Audit Module';
  RAISE NOTICE '';
  RAISE NOTICE 'Database is now better organized and documented!';
  RAISE NOTICE '========================================================';
END $$;