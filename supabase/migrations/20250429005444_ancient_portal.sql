/*
  # Set up auth schema and policies

  1. Schema Updates
    - Enable RLS on auth.users table
    - Add policies for user access
    - Create function to check admin role
    - Add trigger for updating user metadata

  2. Security
    - Enable RLS
    - Add policies for user management
*/

-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
      OR
      (NULLIF(current_setting('request.jwt.claims', true), '')::json->>'raw_user_meta_data')::json->>'role' = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for auth.users
CREATE POLICY "Users can view their own user data" ON auth.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all user data" ON auth.users
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update user data" ON auth.users
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Create trigger function for updating user metadata
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.raw_user_meta_data = 
    COALESCE(OLD.raw_user_meta_data, '{}'::jsonb) || 
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for user updates
CREATE TRIGGER on_user_update
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();