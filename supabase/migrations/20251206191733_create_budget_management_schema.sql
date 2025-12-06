/*
  # Budget Management System - Complete Database Schema

  ## Overview
  This migration creates a complete database schema for a hierarchical budget management system
  used by Polish public administration entities (voivodeships, counties, municipalities, institutions).

  ## New Tables

  ### 1. organizational_units
  Stores hierarchical structure of administrative units
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Unit name (e.g., "Województwo Mazowieckie")
  - `type` (text) - Unit type: voivodeship, county, municipality, institution
  - `parent_id` (uuid, nullable) - Reference to parent unit for hierarchy
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. users
  Stores user accounts with roles and unit assignments
  - `id` (uuid, primary key) - Links to auth.users
  - `name` (text) - Full name
  - `email` (text) - Email address
  - `role` (text) - User role: basic, approver, admin
  - `unit_id` (uuid) - Assigned organizational unit
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. budget_items
  Stores individual budget line items
  - `id` (uuid, primary key) - Unique identifier
  - `unit_id` (uuid) - Unit that owns this budget item
  - `category` (text) - Budget category (e.g., "Wyposażenie", "Remonty")
  - `description` (text) - Detailed description
  - `year` (integer) - Budget year
  - `amount` (numeric) - Budget amount in PLN
  - `status` (text) - Status: draft, pending, approved, rejected
  - `comment` (text, nullable) - Approver comments
  - `submitted_to` (uuid, nullable) - Unit ID where submitted
  - `clarification_status` (text) - Discussion status: none, requested, responded, resolved
  - `has_unread_comments` (boolean) - Unread comments flag
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. budget_submissions
  Tracks budget submissions between units
  - `id` (uuid, primary key) - Unique identifier
  - `from_unit_id` (uuid) - Source unit
  - `to_unit_id` (uuid) - Destination unit
  - `status` (text) - Submission status: draft, pending, approved, returned
  - `submitted_at` (timestamptz) - Submission timestamp
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. budget_submission_items
  Many-to-many relationship between submissions and budget items
  - `submission_id` (uuid) - Reference to submission
  - `budget_item_id` (uuid) - Reference to budget item
  - Primary key: (submission_id, budget_item_id)

  ### 6. budget_comments
  Discussion threads for budget items
  - `id` (uuid, primary key) - Unique identifier
  - `budget_item_id` (uuid) - Related budget item
  - `author_id` (uuid) - Comment author (user)
  - `author_name` (text) - Author display name
  - `content` (text) - Comment text
  - `is_response` (boolean) - Whether this is a response to another comment
  - `parent_comment_id` (uuid, nullable) - Parent comment for threading
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - All tables have RLS enabled
  - Users can view data from their unit and descendant units
  - Users can only modify data from their own unit (based on role)
  - Approvers can approve/reject items submitted to their unit
  - Admins have full access within their unit hierarchy

  ## Indexes
  - Foreign key indexes for performance
  - Composite indexes for common query patterns
  - Status and year indexes for filtering
*/

-- Create custom types for enums
CREATE TYPE unit_type AS ENUM ('voivodeship', 'county', 'municipality', 'institution');
CREATE TYPE user_role AS ENUM ('basic', 'approver', 'admin');
CREATE TYPE budget_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE submission_status AS ENUM ('draft', 'pending', 'approved', 'returned');
CREATE TYPE clarification_status AS ENUM ('none', 'requested', 'responded', 'resolved');

-- =====================================================
-- TABLE: organizational_units
-- =====================================================
CREATE TABLE IF NOT EXISTS organizational_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type unit_type NOT NULL,
  parent_id uuid REFERENCES organizational_units(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0)
);

-- Index for hierarchy queries
CREATE INDEX IF NOT EXISTS idx_organizational_units_parent_id ON organizational_units(parent_id);
CREATE INDEX IF NOT EXISTS idx_organizational_units_type ON organizational_units(type);

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'basic',
  unit_id uuid NOT NULL REFERENCES organizational_units(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_unit_id ON users(unit_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- TABLE: budget_items
-- =====================================================
CREATE TABLE IF NOT EXISTS budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES organizational_units(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  year integer NOT NULL,
  amount numeric(12, 2) NOT NULL,
  status budget_status NOT NULL DEFAULT 'draft',
  comment text,
  submitted_to uuid REFERENCES organizational_units(id) ON DELETE SET NULL,
  clarification_status clarification_status NOT NULL DEFAULT 'none',
  has_unread_comments boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT category_not_empty CHECK (length(trim(category)) > 0),
  CONSTRAINT description_not_empty CHECK (length(trim(description)) > 0),
  CONSTRAINT year_valid CHECK (year >= 2000 AND year <= 2100),
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Indexes for filtering and performance
CREATE INDEX IF NOT EXISTS idx_budget_items_unit_id ON budget_items(unit_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_year ON budget_items(year);
CREATE INDEX IF NOT EXISTS idx_budget_items_status ON budget_items(status);
CREATE INDEX IF NOT EXISTS idx_budget_items_submitted_to ON budget_items(submitted_to);
CREATE INDEX IF NOT EXISTS idx_budget_items_clarification_status ON budget_items(clarification_status);
CREATE INDEX IF NOT EXISTS idx_budget_items_unit_year ON budget_items(unit_id, year);

-- =====================================================
-- TABLE: budget_submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS budget_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_unit_id uuid NOT NULL REFERENCES organizational_units(id) ON DELETE CASCADE,
  to_unit_id uuid NOT NULL REFERENCES organizational_units(id) ON DELETE CASCADE,
  status submission_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT different_units CHECK (from_unit_id != to_unit_id)
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_budget_submissions_from_unit ON budget_submissions(from_unit_id);
CREATE INDEX IF NOT EXISTS idx_budget_submissions_to_unit ON budget_submissions(to_unit_id);
CREATE INDEX IF NOT EXISTS idx_budget_submissions_status ON budget_submissions(status);

-- =====================================================
-- TABLE: budget_submission_items
-- =====================================================
CREATE TABLE IF NOT EXISTS budget_submission_items (
  submission_id uuid NOT NULL REFERENCES budget_submissions(id) ON DELETE CASCADE,
  budget_item_id uuid NOT NULL REFERENCES budget_items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (submission_id, budget_item_id)
);

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_budget_submission_items_budget_item ON budget_submission_items(budget_item_id);

-- =====================================================
-- TABLE: budget_comments
-- =====================================================
CREATE TABLE IF NOT EXISTS budget_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_item_id uuid NOT NULL REFERENCES budget_items(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  is_response boolean DEFAULT false,
  parent_comment_id uuid REFERENCES budget_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0)
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_budget_comments_budget_item ON budget_comments(budget_item_id);
CREATE INDEX IF NOT EXISTS idx_budget_comments_author ON budget_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_budget_comments_parent ON budget_comments(parent_comment_id);

-- =====================================================
-- FUNCTIONS: Helper functions for RLS
-- =====================================================

-- Function to get all descendant unit IDs (recursive)
CREATE OR REPLACE FUNCTION get_descendant_units(unit_uuid uuid)
RETURNS TABLE(descendant_id uuid) AS $$
  WITH RECURSIVE descendants AS (
    SELECT id FROM organizational_units WHERE parent_id = unit_uuid
    UNION
    SELECT ou.id FROM organizational_units ou
    INNER JOIN descendants d ON ou.parent_id = d.id
  )
  SELECT id FROM descendants;
$$ LANGUAGE SQL STABLE;

-- Function to get all ancestor unit IDs (recursive)
CREATE OR REPLACE FUNCTION get_ancestor_units(unit_uuid uuid)
RETURNS TABLE(ancestor_id uuid) AS $$
  WITH RECURSIVE ancestors AS (
    SELECT parent_id as id FROM organizational_units WHERE id = unit_uuid AND parent_id IS NOT NULL
    UNION
    SELECT ou.parent_id as id FROM organizational_units ou
    INNER JOIN ancestors a ON ou.id = a.id
    WHERE ou.parent_id IS NOT NULL
  )
  SELECT id FROM ancestors;
$$ LANGUAGE SQL STABLE;

-- Function to check if user can access unit (user's unit or descendants)
CREATE OR REPLACE FUNCTION can_access_unit(target_unit_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
      unit_id = target_unit_id
      OR target_unit_id IN (SELECT descendant_id FROM get_descendant_units(unit_id))
    )
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY: Enable RLS on all tables
-- =====================================================

ALTER TABLE organizational_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_submission_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: organizational_units
-- =====================================================

CREATE POLICY "Users can view their unit and descendants"
  ON organizational_units FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT unit_id FROM users WHERE id = auth.uid()
      UNION
      SELECT descendant_id FROM get_descendant_units(
        (SELECT unit_id FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Admins can insert units in their hierarchy"
  ON organizational_units FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND (
        unit_id = parent_id
        OR parent_id IN (SELECT descendant_id FROM get_descendant_units(unit_id))
      )
    )
  );

CREATE POLICY "Admins can update units in their hierarchy"
  ON organizational_units FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND can_access_unit(organizational_units.id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND can_access_unit(organizational_units.id)
    )
  );

CREATE POLICY "Admins can delete units in their hierarchy"
  ON organizational_units FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND can_access_unit(organizational_units.id)
    )
  );

-- =====================================================
-- RLS POLICIES: users
-- =====================================================

CREATE POLICY "Users can view users in their unit hierarchy"
  ON users FOR SELECT
  TO authenticated
  USING (
    unit_id IN (
      SELECT unit_id FROM users WHERE id = auth.uid()
      UNION
      SELECT descendant_id FROM get_descendant_units(
        (SELECT unit_id FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Admins can insert users in their hierarchy"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
      AND can_access_unit(unit_id)
    )
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update users in their hierarchy"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
      AND can_access_unit(users.unit_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
      AND can_access_unit(users.unit_id)
    )
  );

CREATE POLICY "Admins can delete users in their hierarchy"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
      AND can_access_unit(users.unit_id)
    )
  );

-- =====================================================
-- RLS POLICIES: budget_items
-- =====================================================

CREATE POLICY "Users can view budget items in their hierarchy"
  ON budget_items FOR SELECT
  TO authenticated
  USING (
    can_access_unit(unit_id)
    OR submitted_to IN (
      SELECT unit_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert budget items for their unit"
  ON budget_items FOR INSERT
  TO authenticated
  WITH CHECK (
    unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update budget items in their unit"
  ON budget_items FOR UPDATE
  TO authenticated
  USING (
    unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
    OR (
      submitted_to = (SELECT unit_id FROM users WHERE id = auth.uid())
      AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('approver', 'admin'))
    )
  )
  WITH CHECK (
    unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
    OR (
      submitted_to = (SELECT unit_id FROM users WHERE id = auth.uid())
      AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('approver', 'admin'))
    )
  );

CREATE POLICY "Users can delete budget items in their unit"
  ON budget_items FOR DELETE
  TO authenticated
  USING (
    unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
    AND status = 'draft'
  );

-- =====================================================
-- RLS POLICIES: budget_submissions
-- =====================================================

CREATE POLICY "Users can view submissions related to their unit"
  ON budget_submissions FOR SELECT
  TO authenticated
  USING (
    can_access_unit(from_unit_id)
    OR to_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create submissions from their unit"
  ON budget_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    from_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update submissions they created or received"
  ON budget_submissions FOR UPDATE
  TO authenticated
  USING (
    from_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
    OR (
      to_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
      AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('approver', 'admin'))
    )
  )
  WITH CHECK (
    from_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
    OR (
      to_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
      AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('approver', 'admin'))
    )
  );

CREATE POLICY "Users can delete their own draft submissions"
  ON budget_submissions FOR DELETE
  TO authenticated
  USING (
    from_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
    AND status = 'draft'
  );

-- =====================================================
-- RLS POLICIES: budget_submission_items
-- =====================================================

CREATE POLICY "Users can view submission items if they can view the submission"
  ON budget_submission_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budget_submissions bs
      WHERE bs.id = submission_id
      AND (
        can_access_unit(bs.from_unit_id)
        OR bs.to_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can insert submission items for their submissions"
  ON budget_submission_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budget_submissions bs
      WHERE bs.id = submission_id
      AND bs.from_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can delete submission items for their draft submissions"
  ON budget_submission_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budget_submissions bs
      WHERE bs.id = submission_id
      AND bs.from_unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
      AND bs.status = 'draft'
    )
  );

-- =====================================================
-- RLS POLICIES: budget_comments
-- =====================================================

CREATE POLICY "Users can view comments on budget items they can view"
  ON budget_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budget_items bi
      WHERE bi.id = budget_item_id
      AND (
        can_access_unit(bi.unit_id)
        OR bi.submitted_to = (SELECT unit_id FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can insert comments on budget items they can view"
  ON budget_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM budget_items bi
      WHERE bi.id = budget_item_id
      AND (
        can_access_unit(bi.unit_id)
        OR bi.submitted_to = (SELECT unit_id FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON budget_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON budget_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- =====================================================
-- TRIGGERS: Update timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON budget_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();