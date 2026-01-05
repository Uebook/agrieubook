-- Add interests column to users table for storing selected category IDs
-- Run this SQL in Supabase SQL Editor if interests column doesn't exist

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add index for faster queries on interests
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);

-- Note: interests will store an array of category IDs (e.g., ['1', '2', '3'])

