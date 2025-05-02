/*
  # Grant admin access

  Grants admin role to specific user account.
*/

UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'admin')
WHERE email = 'sirvictorapeanyo@gmail.com';