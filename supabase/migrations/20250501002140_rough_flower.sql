/*
  # Add admin event management policies

  1. Security
    - Add policies for admin event creation
    - Add policies for admin event updates
    - Fix reference to auth.users table
*/

-- Add INSERT policy for admins
CREATE POLICY "Admins can create events"
ON events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Add UPDATE policy for admins
CREATE POLICY "Admins can update events"
ON events
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);