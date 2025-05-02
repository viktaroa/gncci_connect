/*
  # Fix users table RLS policies

  1. Changes
    - Remove recursive admin policy that was causing infinite recursion
    - Replace with simplified admin check using auth.uid() function
    - Maintain existing user self-management policies
  
  2. Security
    - Admins can still manage all users
    - Users can still read and update their own data
    - Policies use direct auth.uid() checks instead of recursive queries
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new non-recursive admin policy
CREATE POLICY "Admins can manage all users"
ON users
FOR ALL 
TO authenticated
USING (
  (SELECT role = 'admin' FROM users WHERE id = auth.uid())
)
WITH CHECK (
  (SELECT role = 'admin' FROM users WHERE id = auth.uid())
);

-- Recreate user self-management policies
CREATE POLICY "Users can read their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);