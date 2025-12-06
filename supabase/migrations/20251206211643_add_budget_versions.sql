/*
  # Add Budget Version History

  1. New Tables
    - `budget_versions`
      - `id` (uuid, primary key)
      - `budget_id` (uuid, reference to organizational_units) - identifies which unit's budget this version belongs to
      - `created_at` (timestamptz) - when this version was created
      - `created_by` (uuid, reference to users) - user who triggered this version
      - `action` (text) - type of action: 'submitted', 'approved', 'returned'
      - `items_snapshot` (jsonb) - full snapshot of all budget items at this moment
  
  2. Security
    - Enable RLS on `budget_versions` table
    - Add policies for:
      - Budget owners can view their own budget versions
      - Users can view versions for budgets they can approve (subordinate units)
    
  3. Indexes
    - Index on budget_id for fast version lookup
    - Index on created_at for chronological ordering
*/

CREATE TABLE IF NOT EXISTS budget_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES organizational_units(id),
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES users(id),
  action text NOT NULL CHECK (action IN ('submitted', 'approved', 'returned')),
  items_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_budget_versions_budget_id ON budget_versions(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_versions_created_at ON budget_versions(created_at DESC);

ALTER TABLE budget_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budget versions"
  ON budget_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.unit_id = budget_versions.budget_id
    )
  );

CREATE POLICY "Users can view subordinate budget versions"
  ON budget_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      WITH RECURSIVE unit_hierarchy AS (
        SELECT id, parent_id
        FROM organizational_units
        WHERE id IN (SELECT unit_id FROM users WHERE id = auth.uid())
        
        UNION ALL
        
        SELECT ou.id, ou.parent_id
        FROM organizational_units ou
        INNER JOIN unit_hierarchy uh ON ou.parent_id = uh.id
      )
      SELECT 1 FROM unit_hierarchy
      WHERE id = budget_versions.budget_id
    )
  );

CREATE POLICY "Users can create versions for own budget"
  ON budget_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.unit_id = budget_versions.budget_id
    )
  );