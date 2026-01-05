# 🔧 Vercel Environment Variables Setup Guide

## Quick Setup (Automated)

### Option 1: Using the Script (Recommended)

1. **Navigate to admin directory**:
   ```bash
   cd admin
   ```

2. **Run the setup script**:
   ```bash
   ./set-vercel-env.sh
   ```

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

---

## Manual Setup (Via Vercel Dashboard)

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Login to your account
3. Select your project: **admin-orcin-omega** (or your project name)

### Step 2: Navigate to Environment Variables

1. Click on your project
2. Go to **Settings** (top menu)
3. Click on **Environment Variables** (left sidebar)

### Step 3: Add Environment Variables

Add these **4 variables** one by one:

#### Variable 1: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://isndoxsyjbdzibhkrisj.supabase.co`
- **Environment**: Select **Production**, **Preview**, and **Development**
- Click **Save**

#### Variable 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODg4NTEsImV4cCI6MjA4MzE2NDg1MX0.xAhUBZ-5NCySy6QmF0DheBZaeFZRBBtnHRDHYcpQglo`
- **Environment**: Select **Production**, **Preview**, and **Development**
- Click **Save**

#### Variable 3: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU4ODg1MSwiZXhwIjoyMDgzMTY0ODUxfQ.QqqPY15EB75Dy2oDDKyzaDUMR5i9-wPbNDxa2rH-zqg`
- **Environment**: Select **Production**, **Preview**, and **Development**
- ⚠️ **Important**: Keep this secret! Only for server-side use.
- Click **Save**

#### Variable 4: `NEXT_PUBLIC_APP_URL`
- **Value**: `https://admin-orcin-omega.vercel.app`
- **Environment**: Select **Production**, **Preview**, and **Development**
- Click **Save**

### Step 4: Redeploy

After adding all variables:

1. Go to **Deployments** tab
2. Click on the **three dots** (⋯) next to the latest deployment
3. Click **Redeploy**
4. Or trigger a new deployment by pushing to your Git repository

---

## Verify Setup

### Test the Upload API

After redeploying, test if the API is working:

```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/upload \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"application/pdf","bucket":"books","folder":"test"}'
```

**Expected Response** (if working):
```json
{
  "uploadUrl": "https://...",
  "path": "test/1234567890-test.pdf",
  "token": "...",
  "expiresAt": "..."
}
```

**If you still get an error**, check:
1. All environment variables are set correctly
2. The deployment has been redeployed after adding variables
3. Supabase storage bucket "books" exists

---

## Environment Variables Summary

| Variable | Value | Purpose |
|---------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://isndoxsyjbdzibhkrisj.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Public API key (safe for frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Service role key (backend only) |
| `NEXT_PUBLIC_APP_URL` | `https://admin-orcin-omega.vercel.app` | Your Vercel app URL |

---

## Troubleshooting

### Issue: "Failed to create upload URL"

**Solution**: 
1. Verify all environment variables are set in Vercel
2. Ensure you've redeployed after adding variables
3. Check Supabase storage buckets exist:
   - `books` (for PDFs)
   - `covers` (for cover images)
   - `audio` (for audio files)

### Issue: Environment variables not working

**Solution**:
1. Make sure variables are set for **Production** environment
2. Redeploy the application after adding variables
3. Variables are only available after a new deployment

### Issue: Can't access Vercel Dashboard

**Solution**:
1. Make sure you're logged in: https://vercel.com/login
2. Check you have access to the project
3. Use Vercel CLI as alternative: `vercel env add VARIABLE_NAME production`

---

## Quick Reference

**Vercel Dashboard**: https://vercel.com/dashboard  
**Your Project**: admin-orcin-omega  
**API URL**: https://admin-orcin-omega.vercel.app  
**Supabase Project**: isndoxsyjbdzibhkrisj.supabase.co

---

## ✅ Checklist

- [ ] All 4 environment variables added to Vercel
- [ ] Variables set for Production, Preview, and Development
- [ ] Application redeployed after adding variables
- [ ] Upload API tested and working
- [ ] Mobile app API URL updated (if needed)

---

**Need Help?** Check the Vercel documentation: https://vercel.com/docs/concepts/projects/environment-variables

