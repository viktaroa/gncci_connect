/*
  # Fix Events Permissions and Admin Role Handling

  1. Changes
    - Add helper function to check admin role
    - Update events table RLS policies to properly handle admin access
    - Add policy for admin event management
    
  2. Security
    - Ensures admins can manage all events
    - Maintains existing policies for regular users
*/

-- Create or replace the is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
$$;

-- Update events table policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Admins can manage all events" ON events;
  DROP POLICY IF EXISTS "Anyone can view events" ON events;
  DROP POLICY IF EXISTS "Admins can create events" ON events;
  DROP POLICY IF EXISTS "Admins can update events" ON events;

  -- Recreate policies with correct permissions
  CREATE POLICY "Admins can manage all events"
    ON events
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (is_admin())
    WITH CHECK (is_admin());

  CREATE POLICY "Anyone can view events"
    ON events
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (true);
END $$;