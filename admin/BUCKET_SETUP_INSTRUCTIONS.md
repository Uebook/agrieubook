# Supabase Storage Bucket Setup Instructions

## Issue: "Bucket not found" Error

If you're seeing "Bucket not found" errors when accessing PDF or image URLs, the bucket exists but is **not set to public**.

## Solution: Make the Bucket Public

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click on **Buckets**

### Step 2: Find the `books` Bucket
1. Look for the `books` bucket in the list
2. If it doesn't exist, create it:
   - Click **"New bucket"**
   - Name: `books`
   - **IMPORTANT**: Check **"Public bucket"** checkbox
   - Click **"Create bucket"**

### Step 3: Make Existing Bucket Public
If the bucket already exists but is private:
1. Click on the `books` bucket
2. Go to **Settings** tab
3. Find **"Public bucket"** setting
4. **Enable** it (toggle to ON)
5. Save changes

### Step 4: Verify
1. Try accessing a PDF URL again
2. It should work now

## Alternative: Use Signed URLs (If Bucket Must Stay Private)

If you need to keep the bucket private for security reasons, the code has been updated to automatically use signed URLs as a fallback. Signed URLs work even with private buckets but expire after a set time.

## Buckets Needed

Make sure these buckets exist and are **public**:
- ✅ `books` - For PDFs, images, and curriculum files
- ✅ `audio-books` - For audio files (if using audio books)

## Quick Check

To verify your bucket is public:
1. Go to Supabase Dashboard → Storage → Buckets
2. Check if `books` bucket shows "Public" badge
3. If not, enable "Public bucket" in settings
