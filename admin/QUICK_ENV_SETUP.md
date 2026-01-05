# ⚡ Quick Vercel Environment Variables Setup

## Your Supabase Keys (Ready to Copy)

```
NEXT_PUBLIC_SUPABASE_URL=https://isndoxsyjbdzibhkrisj.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODg4NTEsImV4cCI6MjA4MzE2NDg1MX0.xAhUBZ-5NCySy6QmF0DheBZaeFZRBBtnHRDHYcpQglo

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU4ODg1MSwiZXhwIjoyMDgzMTY0ODUxfQ.QqqPY15EB75Dy2oDDKyzaDUMR5i9-wPbNDxa2rH-zqg

NEXT_PUBLIC_APP_URL=https://admin-orcin-omega.vercel.app
```

## 🚀 Fastest Method: Vercel Dashboard

1. **Go to**: https://vercel.com/dashboard
2. **Click**: Your project → **Settings** → **Environment Variables**
3. **Add each variable** (copy-paste from above)
4. **Select**: Production, Preview, Development
5. **Redeploy**: Deployments → ⋯ → Redeploy

## 🤖 Automated Method: Vercel CLI

```bash
cd admin
./set-vercel-env.sh
vercel --prod
```

---

**That's it!** After redeploy, your upload API will work! 🎉
