-- Quick Fix: Add Missing Columns Only
-- Run this if you already have tables but missing columns

-- Add interests column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add password_hash column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);

-- That's it! This will only add missing columns without recreating existing objects.

