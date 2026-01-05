# 🚀 Vercel Deployment Guide

## Quick Deploy Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Login to Vercel** (if not already logged in):
   ```bash
   cd admin
   vercel login
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Select your project
   - Choose production deployment

3. **Set Environment Variables**:
   After deployment, go to Vercel Dashboard → Your Project → Settings → Environment Variables
   
   Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase Service Role Key
   - `NEXT_PUBLIC_APP_URL` = Your Vercel deployment URL (will be provided after first deploy)

4. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Go to**: https://vercel.com
2. **Click**: "Add New Project"
3. **Import Git Repository**: Select `Uebook/agribook`
4. **Root Directory**: Set to `admin`
5. **Framework Preset**: Next.js (auto-detected)
6. **Environment Variables**: Add all required variables
7. **Deploy**: Click "Deploy"

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://isndoxsyjbdzibhkrisj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODg4NTEsImV4cCI6MjA4MzE2NDg1MX0.xAhUBZ-5NCySy6QmF0DheBZaeFZRBBtnHRDHYcpQglo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU4ODg1MSwiZXhwIjoyMDgzMTY0ODUxfQ.QqqPY15EB75Dy2oDDKyzaDUMR5i9-wPbNDxa2rH-zqg
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## After Deployment

1. **Get your deployment URL** from Vercel Dashboard
2. **Update `NEXT_PUBLIC_APP_URL`** with your actual Vercel URL
3. **Update mobile app API URL** in `mobile/src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'https://your-app.vercel.app';
   ```

## API Endpoints

Once deployed, your API will be available at:
- `https://your-app.vercel.app/api/books`
- `https://your-app.vercel.app/api/authors`
- `https://your-app.vercel.app/api/auth/login`
- `https://your-app.vercel.app/api/auth/register`
- etc.

