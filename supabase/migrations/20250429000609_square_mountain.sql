/*
  # Create core tables for GNCCI Connect

  1. New Tables
    - `companies` - Company profiles
    - `memberships` - Membership records
    - `events` - Chamber events
    - `event_registrations` - Event attendance tracking
    - `business_opportunities` - Business opportunities/tenders
    - `opportunity_applications` - Applications for opportunities
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  registration_number text NOT NULL,
  industry_sector text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Ghana',
  website text,
  description text,
  employee_count integer,
  year_established integer,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own company"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  membership_type text NOT NULL CHECK (membership_type IN ('standard', 'premium', 'enterprise')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired')),
  start_date timestamptz,
  end_date timestamptz,
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company memberships"
  ON memberships FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = memberships.company_id
    AND companies.user_id = auth.uid()
  ));

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('webinar', 'conference', 'workshop', 'networking')),
  registration_link text,
  image_url text,
  capacity integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Business opportunities table
CREATE TABLE IF NOT EXISTS business_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  opportunity_type text NOT NULL CHECK (opportunity_type IN ('tender', 'partnership', 'investment', 'job')),
  sector text NOT NULL,
  deadline timestamptz NOT NULL,
  budget_range text,
  requirements text,
  contact_email text NOT NULL,
  contact_phone text,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view opportunities"
  ON business_opportunities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Companies can create opportunities"
  ON business_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = business_opportunities.company_id
    AND companies.user_id = auth.uid()
  ));

-- Opportunity applications table
CREATE TABLE IF NOT EXISTS opportunity_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES business_opportunities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  cover_letter text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(opportunity_id, company_id)
);

ALTER TABLE opportunity_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their applications"
  ON opportunity_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit applications"
  ON opportunity_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_opportunities_updated_at
  BEFORE UPDATE ON business_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_applications_updated_at
  BEFORE UPDATE ON opportunity_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();