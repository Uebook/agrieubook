-- Add password_hash column to users table for email/password authentication
-- Run this SQL in Supabase SQL Editor if password column doesn't exist

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);

-- Note: In production, always hash passwords with bcrypt before storing
-- Example: const passwordHash = await bcrypt.hash(password, 10);

