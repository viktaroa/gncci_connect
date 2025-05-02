/*
  # Add membership packages and payment integration
  
  1. New Tables
    - `membership_packages` - Defines available membership tiers and their features
      - id (uuid, primary key)
      - name (text)
      - type (text) - sme, corporate, international
      - annual_fee (numeric)
      - description (text)
      - features (text[])
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Changes
    - Add payment gateway settings table
    - Add payment gateway fields to payment_records
    - Update membership_applications to reference packages
    
  3. Security
    - Enable RLS
    - Add admin-only policies for package management
    - Add public read access for packages
*/

-- Create membership_packages table
CREATE TABLE membership_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('sme', 'corporate', 'international')),
  annual_fee numeric(10,2) NOT NULL,
  description text NOT NULL,
  features text[] NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_gateway_settings table
CREATE TABLE payment_gateway_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'paystack',
  public_key text NOT NULL,
  secret_key text NOT NULL,
  webhook_secret text,
  test_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add payment gateway fields to payment_records
ALTER TABLE payment_records
ADD COLUMN payment_gateway text DEFAULT 'paystack',
ADD COLUMN gateway_reference text,
ADD COLUMN gateway_response jsonb;

-- Add package reference to membership_applications
ALTER TABLE membership_applications
ADD COLUMN package_id uuid REFERENCES membership_packages(id);

-- Enable RLS
ALTER TABLE membership_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateway_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active packages"
  ON membership_packages
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON membership_packages
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can access payment gateway settings"
  ON payment_gateway_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_membership_packages_updated_at
  BEFORE UPDATE ON membership_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_gateway_settings_updated_at
  BEFORE UPDATE ON payment_gateway_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default membership packages
INSERT INTO membership_packages (name, type, annual_fee, description, features) VALUES
(
  'SME Membership',
  'sme',
  1000.00,
  'Perfect for small and medium-sized enterprises looking to grow their business network',
  ARRAY[
    'Access to business networking events',
    'Monthly industry insights newsletter',
    'Basic business advisory services',
    'Member directory listing',
    'Discounted event tickets'
  ]
),
(
  'Corporate Membership',
  'corporate',
  2500.00,
  'Comprehensive package for established businesses seeking premium benefits and broader exposure',
  ARRAY[
    'All SME benefits',
    'Priority business matching services',
    'Dedicated account manager',
    'Featured directory listing',
    'Free access to major events',
    'Export/Import documentation support',
    'Access to trade missions'
  ]
),
(
  'International Membership',
  'international',
  5000.00,
  'Premium package for international companies looking to establish presence in Ghana',
  ARRAY[
    'All Corporate benefits',
    'International trade support',
    'Market entry consultation',
    'Government liaison assistance',
    'Investment opportunity matchmaking',
    'Regulatory compliance guidance',
    'VIP networking events access'
  ]
);