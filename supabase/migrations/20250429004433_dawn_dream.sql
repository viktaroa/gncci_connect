/*
  # Create admin account

  1. Creates a new admin user account with secure credentials
  2. Sets the role to 'admin' in user metadata
*/

-- Create admin user with email/password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@gncci.org',
  crypt('GNCCI@admin2025', gen_salt('bf')),
  now(),
  '{"role": "admin", "first_name": "Admin", "last_name": "User"}',
  now(),
  now()
);