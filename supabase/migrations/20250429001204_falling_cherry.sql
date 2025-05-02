/*
  # Update memberships schema

  1. Changes
    - Update membership_type enum values
    - Add payment tracking fields
    - Add payment_records table
    - Add RLS policies
    - Add triggers for payment tracking

  2. Security
    - Enable RLS on payment_records
    - Add policies for viewing and managing payments
*/

-- Update membership_type enum
ALTER TABLE memberships DROP CONSTRAINT memberships_membership_type_check;
ALTER TABLE memberships ADD CONSTRAINT memberships_membership_type_check 
  CHECK (membership_type = ANY (ARRAY['sme'::text, 'corporate'::text, 'international'::text]));

-- Add new columns to memberships
ALTER TABLE memberships 
  ADD COLUMN annual_fee numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN last_payment_date timestamptz,
  ADD COLUMN next_payment_date timestamptz;

-- Create payment_records table
CREATE TABLE payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid REFERENCES memberships(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['bank_transfer', 'card', 'cash', 'mobile_money'])),
  reference text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['success', 'pending', 'failed'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_records
CREATE POLICY "Users can view their company's payment records"
  ON payment_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      JOIN companies c ON c.id = m.company_id
      WHERE m.id = payment_records.membership_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payment records"
  ON payment_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create trigger to update membership payment dates
CREATE OR REPLACE FUNCTION update_membership_payment_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'success' THEN
    UPDATE memberships
    SET 
      last_payment_date = NEW.payment_date,
      next_payment_date = NEW.payment_date + interval '1 year',
      payment_status = 
        CASE 
          WHEN NEW.amount >= annual_fee THEN 'paid'
          WHEN NEW.amount > 0 THEN 'partial'
          ELSE payment_status
        END
    WHERE id = NEW.membership_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_membership_payment_dates
  AFTER INSERT OR UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION update_membership_payment_dates();