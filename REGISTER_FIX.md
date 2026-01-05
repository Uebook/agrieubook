# 🔧 Register API Fix

## ⚠️ Issue

Registration is failing with error: "Failed to create account. Please try again."

## 🔍 Root Cause

The `interests` column might not exist in the `users` table in Supabase.

## ✅ Solution

### Step 1: Add Missing Columns to Users Table

Run this SQL in Supabase SQL Editor:

```sql
-- Add interests column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add password_hash column (for future use)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add index for interests
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);
```

### Step 2: Or Run Complete Schema

Run the complete schema file: `admin/database/COMPLETE_SCHEMA.sql`

This will:
- Create all tables if they don't exist
- Add missing columns
- Create indexes
- Set up triggers

## 🧪 Test After Fix

```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "9876543210",
    "password": "123456",
    "role": "reader",
    "interests": ["1", "2"]
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "9876543210",
    "role": "reader",
    "interests": ["1", "2"]
  }
}
```

## ✅ Status

- ✅ API code updated to handle missing columns gracefully
- ⚠️ Need to add `interests` column in Supabase
- ✅ Error messages improved for debugging

---

**Action Required**: Run the SQL migration in Supabase SQL Editor!

