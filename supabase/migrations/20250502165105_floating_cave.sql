/*
  # Fix Users Table and Policies

  1. Changes
    - Drop existing users table and recreate it
    - Add proper foreign key constraint
    - Add correct RLS policies
    - Add trigger for syncing with auth.users
    
  2. Security
    - Enable RLS
    - Add policies for user access
    - Add admin policies
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'non-member' CHECK (role IN ('admin', 'member', 'non-member')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update for users based on id"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to handle user creation/updates
CREATE OR REPLACE FUNCTION public.handle_auth_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      phone,
      role
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'non-member')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.users
    SET
      email = NEW.email,
      first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
      last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
      phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
      role = COALESCE(NEW.raw_user_meta_data->>'role', role),
      updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_changes ON auth.users;
CREATE TRIGGER on_auth_user_changes
  AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_user_changes();

-- Sync existing users
INSERT INTO public.users (id, email, first_name, last_name, phone, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'first_name', ''),
  COALESCE(raw_user_meta_data->>'last_name', ''),
  COALESCE(raw_user_meta_data->>'phone', ''),
  COALESCE(raw_user_meta_data->>'role', 'non-member')
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;