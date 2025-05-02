/*
  # Update membership applications schema and triggers

  1. Changes
    - Add missing columns and constraints to membership_applications if needed
    - Update policies for better access control
    - Add trigger for handling approved applications
    
  2. Security
    - Maintain RLS policies
    - Add admin-specific policies
*/

-- Add missing columns and update constraints if needed
DO $$ 
BEGIN
  -- Add documents_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_applications' 
    AND column_name = 'documents_url'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN documents_url text[];
  END IF;

  -- Add notes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_applications' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN notes text;
  END IF;

  -- Add reviewed_by if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_applications' 
    AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN reviewed_by uuid REFERENCES auth.users(id);
  END IF;

  -- Add reviewed_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_applications' 
    AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN reviewed_at timestamptz;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own applications" ON membership_applications;
  DROP POLICY IF EXISTS "Users can create applications" ON membership_applications;
  DROP POLICY IF EXISTS "Admins can manage all applications" ON membership_applications;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate policies with improved security
CREATE POLICY "Users can view their own applications"
  ON membership_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = membership_applications.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications"
  ON membership_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = membership_applications.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all applications"
  ON membership_applications
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_membership_application_approval ON membership_applications;

-- Create or replace function to handle application approval
CREATE OR REPLACE FUNCTION handle_membership_application_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Create new membership record
    INSERT INTO memberships (
      company_id,
      membership_type,
      status,
      annual_fee,
      start_date,
      end_date,
      payment_status
    ) VALUES (
      NEW.company_id,
      NEW.membership_type,
      'active',
      NEW.annual_fee,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 year',
      'unpaid'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for application approval
CREATE TRIGGER on_membership_application_approval
  AFTER UPDATE ON membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_membership_application_approval();