/*
  # Add foreign key constraint for membership applications reviewer

  1. Changes
    - Add foreign key constraint between membership_applications.reviewed_by and auth.users.id
    - Add ON DELETE SET NULL behavior for reviewer reference
    
  2. Security
    - Maintains existing RLS policies
    - Preserves data integrity
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'membership_applications_reviewed_by_fkey'
  ) THEN
    ALTER TABLE membership_applications
    ADD CONSTRAINT membership_applications_reviewed_by_fkey
    FOREIGN KEY (reviewed_by)
    REFERENCES auth.users (id)
    ON DELETE SET NULL;
  END IF;
END $$;