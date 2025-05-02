/*
  # Add admin user capability
  
  1. Changes
    - Updates specified user's role to 'admin' in auth.users metadata
    
  2. Security
    - Only superuser can execute this command
    - Maintains existing RLS policies
*/

UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'admin')
WHERE email = 'your.email@example.com';