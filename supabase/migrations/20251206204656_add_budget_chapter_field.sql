/*
  # Add budget_chapter field to budget_items table

  1. Changes
    - Add `budget_chapter` column to `budget_items` table
      - Type: text
      - Required field (NOT NULL)
      - Stores the full budget chapter string (e.g., "75023 – Urzędy gmin (miast i miast na prawach powiatu)")

  2. Notes
    - This field is mandatory for all budget items
    - Format: "{code} – {label}"
    - Budget chapter (rozdział) is dependent on budget division (dział)
    - Chapter code always starts with the division code
    - Existing records will receive a default value during migration
*/

-- Add budget_chapter column with a temporary default value for existing rows
ALTER TABLE budget_items 
ADD COLUMN IF NOT EXISTS budget_chapter text DEFAULT '80101 – Szkoły podstawowe';

-- Remove default after adding column (new inserts must provide value)
ALTER TABLE budget_items 
ALTER COLUMN budget_chapter DROP DEFAULT;

-- Make the column required
ALTER TABLE budget_items 
ALTER COLUMN budget_chapter SET NOT NULL;
