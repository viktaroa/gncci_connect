/*
  # Update User Management Policies and Functions

  1. Changes
    - Update admin check function for better security
    - Drop existing policies before recreating them
    - Add trigger for preserving user metadata
    
  2. Security
    - Use SECURITY DEFINER for admin functions
    - Ensure proper policy cascade
*/

-- Create or replace admin check function with improved security
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

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own data" ON auth.users;
    DROP POLICY IF EXISTS "Admins can view all user data" ON auth.users;
    DROP POLICY IF EXISTS "Admins can update user data" ON auth.users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Recreate policies with proper checks
CREATE POLICY "Users can view their own data"
  ON auth.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all user data"
  ON auth.users
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update user data"
  ON auth.users
  FOR UPDATE
  USING (is_admin());

-- Create or replace trigger function for user updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Preserve existing metadata when updating
  NEW.raw_user_meta_data = 
    COALESCE(OLD.raw_user_meta_data, '{}'::jsonb) || 
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Ensure role is preserved
  IF NEW.raw_user_meta_data->>'role' IS NULL THEN
    NEW.raw_user_meta_data = 
      NEW.raw_user_meta_data || 
      jsonb_build_object('role', COALESCE(OLD.raw_user_meta_data->>'role', 'non-member'));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_update ON auth.users;

-- Add trigger for user updates
CREATE TRIGGER on_auth_user_update
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_update();