# Quick Start Guide: Next.js + Supabase Setup

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - Project Name: `agribook`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for project setup

## Step 2: Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (Keep this secret!)

## Step 3: Set Up Environment Variables

1. Copy the example file:
   ```bash
   cd admin
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and paste your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 4: Set Up Database

1. Go to Supabase Dashboard → **SQL Editor**
2. Click "New Query"
3. Open `database/schema.sql` from the project root
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. Wait for success message ✅

## Step 5: Create Storage Buckets

Go to **Storage** in Supabase Dashboard:

### Create `books` bucket (for PDF files)
1. Click "New bucket"
2. Name: `books`
3. **Public bucket**: ❌ (unchecked - private)
4. Click "Create bucket"

### Create `audio-books` bucket (for audio files)
1. Click "New bucket"
2. Name: `audio-books`
3. **Public bucket**: ❌ (unchecked - private)
4. Click "Create bucket"

### Create `covers` bucket (for cover images)
1. Click "New bucket"
2. Name: `covers`
3. **Public bucket**: ✅ (checked - public)
4. Click "Create bucket"

### Create `curriculum` bucket (for government PDFs)
1. Click "New bucket"
2. Name: `curriculum`
3. **Public bucket**: ❌ (unchecked - private)
4. Click "Create bucket"

## Step 6: Set Storage Policies (Optional - for now)

You can set up Row Level Security (RLS) policies later. For development, we can use service role key.

## Step 7: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Test API endpoint:
   ```bash
   curl http://localhost:3000/api/books
   ```
   
   Should return: `{"books":[],"pagination":{...}}`

## Step 8: You're Ready! 🎉

Now you can:
- Use the API routes in `/app/api/`
- Upload files to Supabase Storage
- Query the database
- Build your features!

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in the `admin/` directory
- Restart the dev server after creating `.env.local`

### Database connection errors
- Check your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Make sure you ran the SQL schema

### Storage upload errors
- Check bucket names match exactly
- Verify bucket exists in Supabase dashboard

## Next Steps

1. ✅ Create Supabase project
2. ✅ Set environment variables
3. ✅ Run database schema
4. ✅ Create storage buckets
5. 🚀 Start building features!

For detailed documentation, see `SETUP_INSTRUCTIONS.md`


