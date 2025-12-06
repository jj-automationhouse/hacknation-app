/*
  # Add Budget Limit Assignment System

  1. New Columns
    - Add `limit_amount` to budget_items table
      - Stores the limit assigned from the higher level
      - NULL for items without assigned limits
    - Add `limit_status` to budget_items table
      - Tracks limit assignment state
      - Values: 'not_assigned', 'limits_assigned', 'limits_distributed'
  
  2. Update Constraints
    - Add CHECK constraint for limit_status values
    - Update budget_versions action constraint to include 'limits_assigned'
  
  3. Details
    - Enables top-down budget limit assignment
    - Supports hierarchical limit distribution
    - Maintains audit trail through budget versions
*/

DO $$
BEGIN
  -- Add limit_amount column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budget_items' AND column_name = 'limit_amount'
  ) THEN
    ALTER TABLE budget_items ADD COLUMN limit_amount numeric(12, 2);
  END IF;

  -- Add limit_status column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budget_items' AND column_name = 'limit_status'
  ) THEN
    ALTER TABLE budget_items ADD COLUMN limit_status text DEFAULT 'not_assigned' CHECK (limit_status IN ('not_assigned', 'limits_assigned', 'limits_distributed'));
  END IF;
END $$;

-- Update budget_versions action constraint to include 'limits_assigned'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'budget_versions_action_check'
  ) THEN
    ALTER TABLE budget_versions DROP CONSTRAINT budget_versions_action_check;
  END IF;
END $$;

ALTER TABLE budget_versions 
  ADD CONSTRAINT budget_versions_action_check 
  CHECK (action IN ('submitted', 'approved', 'returned', 'edited', 'limits_assigned'));