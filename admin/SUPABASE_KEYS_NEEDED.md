# Supabase Keys Needed

## 🔑 Required Keys (3 Keys)

You need to provide these 3 keys from your Supabase project:

### 1. **NEXT_PUBLIC_SUPABASE_URL**
- **What it is**: Your Supabase project URL
- **Format**: `https://xxxxxxxxxxxxx.supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

### 2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **What it is**: Public/Anonymous key (safe to expose in frontend)
- **Format**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
- **Where to find**: Supabase Dashboard → Settings → API → anon public key

### 3. **SUPABASE_SERVICE_ROLE_KEY**
- **What it is**: Service role key (KEEP SECRET! Only for backend)
- **Format**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
- **Where to find**: Supabase Dashboard → Settings → API → service_role key
- **⚠️ WARNING**: Never expose this key publicly! Only use in server-side code.

---

## 📍 Where to Find These Keys

### Step-by-Step:

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Login to your account

2. **Select Your Project**
   - Click on your project (or create one if you don't have it)

3. **Go to Settings → API**
   - Click on ⚙️ **Settings** (left sidebar)
   - Click on **API** (under Project Settings)

4. **Copy the Keys**
   - **Project URL**: Copy the URL shown under "Project URL"
   - **anon public key**: Copy the key shown under "Project API keys" → "anon" → "public"
   - **service_role key**: Copy the key shown under "Project API keys" → "service_role" → "secret"

---

## 📝 How to Add Keys

### Create `.env.local` file in `admin/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyfQ.your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MTYyMzkwMjJ9.your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Quick Copy-Paste Format

Just provide me these 3 values:

```
1. Project URL: https://xxxxx.supabase.co
2. Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
3. Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

I'll create the `.env.local` file for you!

---

## ⚠️ Important Notes

- **anon key**: Safe to use in frontend (browser)
- **service_role key**: NEVER expose in frontend! Only for server-side API routes
- **Project URL**: Public, safe to expose
- Don't commit `.env.local` to git (it's already in .gitignore)

---

## 🔍 Visual Guide

In Supabase Dashboard → Settings → API, you'll see:

```
Project URL
https://xxxxxxxxxxxxx.supabase.co
[Copy]

Project API keys
┌─────────────────────────────────────┐
│ anon / public                       │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9│
│ [Copy]                              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ service_role / secret                │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9│
│ [Copy]                              │
└─────────────────────────────────────┘
```

---

## ✅ After Adding Keys

1. Restart the dev server:
   ```bash
   cd admin
   npm run dev
   ```

2. The blank page should be fixed!

3. If you haven't set up Supabase yet, the app will show a warning but won't crash.

