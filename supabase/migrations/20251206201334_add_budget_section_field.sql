/*
  # Add budget_section field to budget_items table

  1. Changes
    - Add `budget_section` column to `budget_items` table
      - Type: text
      - Required field (NOT NULL)
      - Stores the full budget section string (e.g., "15/04 – Sądy powszechne – Sąd Apelacyjny w Gdańsku")

  2. Notes
    - This field is mandatory for all budget items
    - Format: "{code} – {label}" or "{code} – {parent_label} – {sublabel}" for hierarchical sections
    - Existing records will need default value during migration
*/

-- Add budget_section column with a temporary default value for existing rows
ALTER TABLE budget_items 
ADD COLUMN IF NOT EXISTS budget_section text DEFAULT '01 – Kancelaria Prezydenta RP';

-- Remove default after adding column (new inserts must provide value)
ALTER TABLE budget_items 
ALTER COLUMN budget_section DROP DEFAULT;

-- Make the column required
ALTER TABLE budget_items 
ALTER COLUMN budget_section SET NOT NULL;
