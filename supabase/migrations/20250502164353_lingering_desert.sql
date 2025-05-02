/*
  # Create users table for user management

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches Supabase Auth user id
      - `email` (text, unique) - user's email address
      - `first_name` (text) - user's first name
      - `last_name` (text) - user's last name
      - `phone` (text, nullable) - user's phone number
      - `role` (text) - user's role (admin, member, non-member)
      - `created_at` (timestamptz) - timestamp of user creation
      - `updated_at` (timestamptz) - timestamp of last update

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Admins can manage all users
      - Users can read their own data
      - Users can update their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'non-member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'member', 'non-member'))
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all users"
  ON public.users
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  ));

CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();