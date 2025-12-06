/*
  # Add budget_division field to budget_items table

  1. Changes
    - Add `budget_division` column to `budget_items` table
      - Type: text
      - Required field (NOT NULL)
      - Stores the full budget division string (e.g., "750 – Administracja publiczna")

  2. Notes
    - This field is mandatory for all budget items
    - Format: "{code} – {label}"
    - Existing records will receive a default value during migration
*/

-- Add budget_division column with a temporary default value for existing rows
ALTER TABLE budget_items 
ADD COLUMN IF NOT EXISTS budget_division text DEFAULT '750 – Administracja publiczna';

-- Remove default after adding column (new inserts must provide value)
ALTER TABLE budget_items 
ALTER COLUMN budget_division DROP DEFAULT;

-- Make the column required
ALTER TABLE budget_items 
ALTER COLUMN budget_division SET NOT NULL;
