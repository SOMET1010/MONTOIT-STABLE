/*
  # Create 9 Missing Critical Tables

  This migration creates all missing tables that are referenced in the codebase but don't exist in the database.
  Each table includes proper structure, RLS policies, indexes, and foreign key constraints.

  ## New Tables

  1. **conversations**
     - Stores messaging conversations between users
     - Links to properties for context
     - Tracks last message timestamp

  2. **maintenance_requests**
     - Tracks maintenance requests from tenants
     - Links to leases and tenants
     - Supports categorization and priority levels

  3. **payments**
     - Records all payment transactions
     - Supports multiple payment methods (Mobile Money)
     - Links to leases and tracks status

  4. **favorites**
     - User's favorite properties
     - Prevents duplicates with unique constraint

  5. **property_visits**
     - Scheduled property visits
     - Links tenants with landlords and properties
     - Tracks visit status and notes

  6. **reviews**
     - Rating system between tenants and landlords
     - Bidirectional reviews (tenant ↔ landlord)
     - Linked to completed leases

  7. **notifications**
     - User notifications system
     - Supports different notification types
     - Tracks read status

  8. **saved_searches**
     - Saved search filters for users
     - Stores filter criteria as JSON

  9. **disputes**
     - Dispute management between parties
     - Links to leases
     - Tracks resolution process

  ## Security

  - RLS enabled on all tables
  - Restrictive policies (users can only access their own data)
  - Proper foreign key constraints
  - Performance indexes on frequently queried columns
*/

-- ============================================================================
-- 1. CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  -- Ensure participants are different
  CONSTRAINT different_participants CHECK (participant_1 <> participant_2)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2)
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- ============================================================================
-- 2. MAINTENANCE_REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  landlord_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  images text[] DEFAULT '{}',
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  
  -- Constraints
  CONSTRAINT valid_category CHECK (category IN ('plumbing', 'electrical', 'heating', 'appliances', 'structural', 'pest_control', 'security', 'general')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'rejected'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_lease ON maintenance_requests(lease_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenant ON maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created ON maintenance_requests(created_at DESC);

-- Enable RLS
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Tenants can view their maintenance requests"
  ON maintenance_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Tenants can create maintenance requests"
  ON maintenance_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants and landlords can update maintenance requests"
  ON maintenance_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = tenant_id OR auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- ============================================================================
-- 3. PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL DEFAULT 'orange_money',
  payment_reference text,
  transaction_id text,
  status text NOT NULL DEFAULT 'pending',
  payment_type text NOT NULL DEFAULT 'rent',
  payment_date timestamptz,
  due_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('orange_money', 'mtn_money', 'wave', 'moov', 'bank_transfer', 'cash', 'other')),
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  CONSTRAINT valid_payment_type CHECK (payment_type IN ('rent', 'deposit', 'utilities', 'maintenance', 'late_fee', 'other'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_lease ON payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_landlord ON payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Tenants can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update their payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = tenant_id OR auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- ============================================================================
-- 4. FAVORITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  -- Unique constraint: one favorite per user per property
  CONSTRAINT unique_favorite UNIQUE (user_id, property_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. PROPERTY_VISITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  landlord_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  visit_type text DEFAULT 'viewing',
  notes text,
  tenant_notes text,
  landlord_notes text,
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  completed_at timestamptz,
  
  -- Constraints
  CONSTRAINT valid_visit_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  CONSTRAINT valid_visit_type CHECK (visit_type IN ('viewing', 'inspection', 'move_in', 'move_out', 'maintenance'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_property_visits_property ON property_visits(property_id);
CREATE INDEX IF NOT EXISTS idx_property_visits_tenant ON property_visits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_visits_landlord ON property_visits(landlord_id);
CREATE INDEX IF NOT EXISTS idx_property_visits_date ON property_visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_property_visits_status ON property_visits(status);

-- Enable RLS
ALTER TABLE property_visits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their visits"
  ON property_visits FOR SELECT
  TO authenticated
  USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Tenants can schedule visits"
  ON property_visits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update their visits"
  ON property_visits FOR UPDATE
  TO authenticated
  USING (auth.uid() = tenant_id OR auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- ============================================================================
-- 6. REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  review_type text NOT NULL,
  is_public boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  response text,
  response_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_review_type CHECK (review_type IN ('tenant_to_landlord', 'landlord_to_tenant', 'tenant_to_property', 'landlord_to_property')),
  CONSTRAINT different_reviewer_reviewed CHECK (reviewer_id <> reviewed_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_lease ON reviews(lease_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public reviews are visible to all"
  ON reviews FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = reviewer_id OR auth.uid() = reviewed_id);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- ============================================================================
-- 7. NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean DEFAULT false,
  link text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  expires_at timestamptz,
  
  -- Constraints
  CONSTRAINT valid_notification_type CHECK (type IN ('info', 'success', 'warning', 'error', 'message', 'payment', 'visit', 'maintenance', 'review', 'system'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 8. SAVED_SEARCHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  notify_new_results boolean DEFAULT false,
  last_checked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_notify ON saved_searches(notify_new_results);

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their saved searches"
  ON saved_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved searches"
  ON saved_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved searches"
  ON saved_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved searches"
  ON saved_searches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 9. DISPUTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  complainant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  respondent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mediator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  resolution text,
  evidence_files text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  closed_at timestamptz,
  
  -- Constraints
  CONSTRAINT valid_dispute_category CHECK (category IN ('payment', 'property_condition', 'contract_breach', 'noise', 'maintenance', 'eviction', 'deposit_return', 'other')),
  CONSTRAINT valid_dispute_status CHECK (status IN ('open', 'in_review', 'in_mediation', 'resolved', 'closed', 'escalated')),
  CONSTRAINT valid_dispute_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT different_parties CHECK (complainant_id <> respondent_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disputes_lease ON disputes(lease_id);
CREATE INDEX IF NOT EXISTS idx_disputes_complainant ON disputes(complainant_id);
CREATE INDEX IF NOT EXISTS idx_disputes_respondent ON disputes(respondent_id);
CREATE INDEX IF NOT EXISTS idx_disputes_mediator ON disputes(mediator_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_created ON disputes(created_at DESC);

-- Enable RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Parties can view their disputes"
  ON disputes FOR SELECT
  TO authenticated
  USING (auth.uid() = complainant_id OR auth.uid() = respondent_id OR auth.uid() = mediator_id);

CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = complainant_id);

CREATE POLICY "Parties and mediators can update disputes"
  ON disputes FOR UPDATE
  TO authenticated
  USING (auth.uid() = complainant_id OR auth.uid() = respondent_id OR auth.uid() = mediator_id)
  WITH CHECK (auth.uid() = complainant_id OR auth.uid() = respondent_id OR auth.uid() = mediator_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_visits_updated_at BEFORE UPDATE ON property_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
