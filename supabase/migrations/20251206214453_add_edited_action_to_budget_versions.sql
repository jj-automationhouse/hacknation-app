/*
  # Add 'edited' action to budget_versions

  1. Changes
    - Drop existing CHECK constraint on action column
    - Add new CHECK constraint that includes 'edited' as a valid action type
  
  2. Details
    - This allows budget versions to be created when users edit budget items
    - The 'edited' action is used to track manual edits to non-draft budget items
*/

DO $$
BEGIN
  -- Drop the old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'budget_versions_action_check'
  ) THEN
    ALTER TABLE budget_versions DROP CONSTRAINT budget_versions_action_check;
  END IF;
END $$;

-- Add new constraint with 'edited' included
ALTER TABLE budget_versions 
  ADD CONSTRAINT budget_versions_action_check 
  CHECK (action IN ('submitted', 'approved', 'returned', 'edited'));