# Next.js + Supabase Setup Checklist

## ✅ Step 1: Dependencies Installed
- [x] `@supabase/supabase-js` installed
- [x] `@supabase/ssr` installed

## 📋 Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Login (free account is fine)
3. Click "New Project"
4. Fill in:
   - **Project Name**: `agribook`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., Southeast Asia - Mumbai)
5. Click "Create new project"
6. ⏳ Wait 2-3 minutes for setup

## 🔑 Step 3: Get API Keys

1. In Supabase Dashboard → Go to **Settings** (⚙️) → **API**
2. Copy these values:

   **Project URL**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key**
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **service_role key** (Keep SECRET!)
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 📝 Step 4: Create .env.local File

1. In the `admin/` directory, create `.env.local`:
   ```bash
   cd admin
   touch .env.local
   ```

2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 🗄️ Step 5: Set Up Database

1. In Supabase Dashboard → Go to **SQL Editor**
2. Click "New Query"
3. Open `database/schema.sql` (from project root)
4. Copy ALL the SQL code
5. Paste into SQL Editor
6. Click "Run" (or Cmd/Ctrl + Enter)
7. ✅ Wait for "Success. No rows returned"

## 📦 Step 6: Create Storage Buckets

Go to **Storage** in Supabase Dashboard:

### Bucket 1: `books`
- Click "New bucket"
- Name: `books`
- Public: ❌ (unchecked)
- Create

### Bucket 2: `audio-books`
- Click "New bucket"
- Name: `audio-books`
- Public: ❌ (unchecked)
- Create

### Bucket 3: `covers`
- Click "New bucket"
- Name: `covers`
- Public: ✅ (checked)
- Create

### Bucket 4: `curriculum`
- Click "New bucket"
- Name: `curriculum`
- Public: ❌ (unchecked)
- Create

## ✅ Step 7: Verify Setup

1. Restart dev server:
   ```bash
   npm run dev
   ```

2. Test API:
   ```bash
   curl http://localhost:3000/api/books
   ```

   Should return:
   ```json
   {"books":[],"pagination":{"page":1,"limit":20,"total":0,"totalPages":0}}
   ```

## 🎉 You're Ready!

Now you can:
- ✅ Use API routes (`/api/books`, `/api/upload`, etc.)
- ✅ Upload files to Supabase Storage
- ✅ Query database
- ✅ Build features!

---

## Quick Commands

```bash
# Install dependencies (already done ✅)
cd admin && npm install

# Create .env.local (manually create file)
touch .env.local

# Start dev server
npm run dev

# Test API
curl http://localhost:3000/api/books
```


