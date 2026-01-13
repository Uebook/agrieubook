-- Create admin user for login
-- Run this SQL in Supabase SQL Editor to create an admin user

-- Insert admin user (or update if exists)
INSERT INTO users (id, name, email, mobile, role, password_hash, status, created_at)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@agribook.com',
  '1234567890',
  'admin',
  'password', -- Plain text password for development (use bcrypt hash in production!)
  'active',
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  role = 'admin',
  password_hash = 'password', -- Update password if user exists
  status = 'active';

-- Note: In production, hash passwords with bcrypt before storing
-- Example Node.js code:
-- const bcrypt = require('bcrypt');
-- const passwordHash = await bcrypt.hash('admin123', 10);
-- Then use passwordHash instead of 'admin123' above

-- You can also create additional admin users:
-- INSERT INTO users (id, name, email, mobile, role, password_hash, status, created_at)
-- VALUES (
--   gen_random_uuid(),
--   'Another Admin',
--   'admin2@agribook.com',
--   '9876543210',
--   'admin',
--   'password123', -- Change this!
--   'active',
--   NOW()
-- )
-- ON CONFLICT (email) DO NOTHING;
