/*
  # Add admin permissions and roles

  1. Security
    - Add admin-specific RLS policies for all tables
    - Allow admins to manage all data
    - Add admin role check function

  2. Changes
    - Add policies for companies table
    - Add policies for memberships table
    - Add policies for events table
    - Add policies for business opportunities table
*/

-- Create admin role check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      current_setting('request.jwt.claims', true)::json->>'role' = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies to companies
CREATE POLICY "Admins can manage all companies"
  ON companies
  FOR ALL
  USING (is_admin());

-- Add admin policies to memberships
CREATE POLICY "Admins can manage all memberships"
  ON memberships
  FOR ALL
  USING (is_admin());

-- Add admin policies to events
CREATE POLICY "Admins can manage all events"
  ON events
  FOR ALL
  USING (is_admin());

-- Add admin policies to business_opportunities
CREATE POLICY "Admins can manage all opportunities"
  ON business_opportunities
  FOR ALL
  USING (is_admin());

-- Add admin policies to event_registrations
CREATE POLICY "Admins can manage all event registrations"
  ON event_registrations
  FOR ALL
  USING (is_admin());

-- Add admin policies to opportunity_applications
CREATE POLICY "Admins can manage all applications"
  ON opportunity_applications
  FOR ALL
  USING (is_admin());