-- Update admin user password to "password"
-- Run this SQL in Supabase SQL Editor

-- Update admin user password
UPDATE users
SET 
  password_hash = 'password',
  updated_at = NOW()
WHERE email = 'admin@agribook.com';

-- If user doesn't exist, create it
INSERT INTO users (id, name, email, mobile, role, password_hash, status, created_at)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@agribook.com',
  '1234567890',
  'admin',
  'password', -- Plain text password
  'active',
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  role = 'admin',
  password_hash = 'password',
  status = 'active',
  updated_at = NOW();

-- Verify the update
SELECT id, name, email, role, password_hash, status 
FROM users 
WHERE email = 'admin@agribook.com';
