/*
  # Assign admin reviewer to membership applications
  
  1. Changes
    - Updates all membership applications to set reviewed_by to admin user
    - Sets reviewed_at timestamp for existing applications
*/

-- Get admin user ID
WITH admin_user AS (
  SELECT id 
  FROM auth.users 
  WHERE email = 'sirvictorapeayo@gmail.com'
)
UPDATE membership_applications
SET 
  reviewed_by = (SELECT id FROM admin_user),
  reviewed_at = CASE 
    WHEN status != 'pending' THEN now()
    ELSE reviewed_at
  END
WHERE status != 'pending';