/*
  # Add admin access to user emails
  
  1. Security
    - Add policy to allow admins to read user email addresses
    - Required for viewing reviewer information in membership applications
*/

-- Add policy to allow admins to access auth.users table
CREATE POLICY "Allow admins to read user emails"
ON auth.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);