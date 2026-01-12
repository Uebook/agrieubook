# 📱 Supabase Mobile App Setup

## 🔑 Step 1: Get Your Supabase Credentials

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (the long JWT token)

## 📝 Step 2: Configure Supabase Client

Open `mobile/src/lib/supabase.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';  // Replace with your actual URL
const SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';  // Replace with your actual anon key
```

**Example:**
```javascript
const SUPABASE_URL = 'https://isndoxsyjbdzibhkrisj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## ✅ Step 3: Verify Storage Bucket

Make sure you have an `avatars` bucket in Supabase Storage:

1. Go to Supabase Dashboard → **Storage**
2. Check if `avatars` bucket exists
3. If not, create it:
   - Click "New bucket"
   - Name: `avatars`
   - **Public bucket**: ✅ (checked - public)
   - Click "Create bucket"

## 🎯 How It Works Now

1. **Mobile app uploads directly to Supabase Storage**
   - When user selects a profile picture, it's uploaded directly to Supabase
   - The app gets the public URL from Supabase

2. **Mobile app sends JSON to API**
   - The profile update API now receives JSON (not FormData)
   - The JSON includes the `avatar_url` from Supabase

3. **Backend updates database**
   - The API simply updates the user record with the new `avatar_url`
   - No file handling needed on the backend

## 🚀 Benefits

- ✅ Faster uploads (direct to Supabase)
- ✅ Simpler backend code (no file handling)
- ✅ Better reliability (Supabase handles file storage)
- ✅ Consistent with modern architecture

---

**Note:** The `anon` key is safe to use in mobile apps. It's designed for client-side use.
