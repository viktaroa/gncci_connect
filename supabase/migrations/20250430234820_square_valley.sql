/*
  # Fix admin authentication

  1. Changes
    - Updates admin user metadata structure
    - Ensures proper role assignment
    - Adds missing metadata fields
    
  2. Security
    - Maintains existing RLS policies
    - Preserves user authentication
*/

-- Update admin user metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'admin',
  'first_name', 'Admin',
  'last_name', 'User',
  'phone', ''
)
WHERE email = 'admin@gncci.org';

-- Ensure admin role is set in user metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || 
  jsonb_build_object('role', 'admin')
WHERE email = 'admin@gncci.org'
AND (raw_user_meta_data->>'role' IS NULL OR raw_user_meta_data->>'role' != 'admin');

-- Add any missing required metadata fields
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || 
  jsonb_build_object(
    'first_name', COALESCE(raw_user_meta_data->>'first_name', 'Admin'),
    'last_name', COALESCE(raw_user_meta_data->>'last_name', 'User'),
    'phone', COALESCE(raw_user_meta_data->>'phone', '')
  )
WHERE email = 'admin@gncci.org';