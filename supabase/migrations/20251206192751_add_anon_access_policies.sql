/*
  # Add Anonymous Access Policies for Development

  ## Overview
  This migration adds RLS policies that allow anonymous (unauthenticated) access to all tables.
  This is necessary for the demo application which doesn't use Supabase authentication.

  ## Security Note
  - These policies grant full access to anonymous users
  - Suitable for development and demo environments only
  - For production, implement proper authentication and remove these policies

  ## Policies Added
  
  ### organizational_units
  - Allow anonymous users to view all organizational units
  
  ### users
  - Allow anonymous users to view, insert, update, and delete users
  
  ### budget_items
  - Allow anonymous users full access to budget items
  
  ### budget_submissions
  - Allow anonymous users full access to submissions
  
  ### budget_submission_items
  - Allow anonymous users full access to submission items
  
  ### budget_comments
  - Allow anonymous users full access to comments
*/

-- organizational_units: Allow anon access
DROP POLICY IF EXISTS "Anon users can view all organizational units" ON organizational_units;
CREATE POLICY "Anon users can view all organizational units"
  ON organizational_units FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon users can insert organizational units" ON organizational_units;
CREATE POLICY "Anon users can insert organizational units"
  ON organizational_units FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can update organizational units" ON organizational_units;
CREATE POLICY "Anon users can update organizational units"
  ON organizational_units FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can delete organizational units" ON organizational_units;
CREATE POLICY "Anon users can delete organizational units"
  ON organizational_units FOR DELETE
  TO anon
  USING (true);

-- users: Allow anon access
DROP POLICY IF EXISTS "Anon users can view all users" ON users;
CREATE POLICY "Anon users can view all users"
  ON users FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon users can insert users" ON users;
CREATE POLICY "Anon users can insert users"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can update users" ON users;
CREATE POLICY "Anon users can update users"
  ON users FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can delete users" ON users;
CREATE POLICY "Anon users can delete users"
  ON users FOR DELETE
  TO anon
  USING (true);

-- budget_items: Allow anon access
DROP POLICY IF EXISTS "Anon users can view all budget items" ON budget_items;
CREATE POLICY "Anon users can view all budget items"
  ON budget_items FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon users can insert budget items" ON budget_items;
CREATE POLICY "Anon users can insert budget items"
  ON budget_items FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can update budget items" ON budget_items;
CREATE POLICY "Anon users can update budget items"
  ON budget_items FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can delete budget items" ON budget_items;
CREATE POLICY "Anon users can delete budget items"
  ON budget_items FOR DELETE
  TO anon
  USING (true);

-- budget_submissions: Allow anon access
DROP POLICY IF EXISTS "Anon users can view all submissions" ON budget_submissions;
CREATE POLICY "Anon users can view all submissions"
  ON budget_submissions FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon users can insert submissions" ON budget_submissions;
CREATE POLICY "Anon users can insert submissions"
  ON budget_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can update submissions" ON budget_submissions;
CREATE POLICY "Anon users can update submissions"
  ON budget_submissions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can delete submissions" ON budget_submissions;
CREATE POLICY "Anon users can delete submissions"
  ON budget_submissions FOR DELETE
  TO anon
  USING (true);

-- budget_submission_items: Allow anon access
DROP POLICY IF EXISTS "Anon users can view all submission items" ON budget_submission_items;
CREATE POLICY "Anon users can view all submission items"
  ON budget_submission_items FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon users can insert submission items" ON budget_submission_items;
CREATE POLICY "Anon users can insert submission items"
  ON budget_submission_items FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can update submission items" ON budget_submission_items;
CREATE POLICY "Anon users can update submission items"
  ON budget_submission_items FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can delete submission items" ON budget_submission_items;
CREATE POLICY "Anon users can delete submission items"
  ON budget_submission_items FOR DELETE
  TO anon
  USING (true);

-- budget_comments: Allow anon access
DROP POLICY IF EXISTS "Anon users can view all comments" ON budget_comments;
CREATE POLICY "Anon users can view all comments"
  ON budget_comments FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon users can insert comments" ON budget_comments;
CREATE POLICY "Anon users can insert comments"
  ON budget_comments FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can update comments" ON budget_comments;
CREATE POLICY "Anon users can update comments"
  ON budget_comments FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can delete comments" ON budget_comments;
CREATE POLICY "Anon users can delete comments"
  ON budget_comments FOR DELETE
  TO anon
  USING (true);