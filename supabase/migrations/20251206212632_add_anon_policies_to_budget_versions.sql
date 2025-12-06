/*
  # Add Anonymous Access Policies for Budget Versions

  ## Overview
  This migration adds RLS policies that allow anonymous (unauthenticated) access to budget_versions table.
  This is necessary for the demo application which doesn't use Supabase authentication.

  ## Security Note
  - These policies grant full access to anonymous users
  - Suitable for development and demo environments only
  - For production, implement proper authentication and remove these policies

  ## Policies Added
  
  ### budget_versions
  - Allow anonymous users to view all budget versions
  - Allow anonymous users to create budget versions
*/

DROP POLICY IF EXISTS "Anon users can view all budget versions" ON budget_versions;
CREATE POLICY "Anon users can view all budget versions"
  ON budget_versions FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon users can insert budget versions" ON budget_versions;
CREATE POLICY "Anon users can insert budget versions"
  ON budget_versions FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can update budget versions" ON budget_versions;
CREATE POLICY "Anon users can update budget versions"
  ON budget_versions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can delete budget versions" ON budget_versions;
CREATE POLICY "Anon users can delete budget versions"
  ON budget_versions FOR DELETE
  TO anon
  USING (true);