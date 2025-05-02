/*
  # Add membership application functionality

  1. New Tables
    - `membership_applications` - Track membership applications
      - id (uuid, primary key)
      - company_id (uuid, references companies)
      - membership_type (text)
      - status (text)
      - annual_fee (numeric)
      - documents_url (text[])
      - notes (text)
      - reviewed_by (uuid)
      - reviewed_at (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users and admins
*/

-- Create membership_applications table
CREATE TABLE membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  membership_type text NOT NULL CHECK (membership_type IN ('sme', 'corporate', 'international')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  annual_fee numeric(10,2) NOT NULL DEFAULT 0.00,
  documents_url text[],
  notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create trigger for updated_at
CREATE TRIGGER update_membership_applications_updated_at
  BEFORE UPDATE ON membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle application approval
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