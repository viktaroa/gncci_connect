/*
  # Fix infinite recursion in user policies
  
  1. Changes
    - Simplify admin check to use JWT claims instead of querying the users table
    - Update policies to avoid recursive queries
    - Maintain existing functionality while fixing the recursion issue
    
  2. Security
    - Preserve access control
    - Use JWT claims for role checks
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow admins to read user emails" ON auth.users;

-- Create new policies that avoid recursion
CREATE POLICY "Admins can manage all users"
ON users
FOR ALL 
TO authenticated
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
)
WITH CHECK (
  current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
);

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

-- Add policy for admin access to auth.users
CREATE POLICY "Allow admins to read user emails"
ON auth.users
FOR SELECT
TO authenticated
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
);