# 🚀 Deployment URLs

## ✅ Admin Panel & API - Deployed to Vercel

### Production URLs:
1. **Main URL**: https://admin-orcin-omega.vercel.app
2. **Direct URL**: https://admin-ooilep1i4-abhisheks-projects-19c6e9a3.vercel.app

### API Endpoints:
All API endpoints are available at:
- **Base URL**: `https://admin-orcin-omega.vercel.app`

#### Available API Routes:
- `GET/POST /api/books` - Books management
- `GET/PUT/DELETE /api/books/[id]` - Single book operations
- `GET /api/books/[id]/download` - Book PDF download
- `GET/POST /api/audio-books` - Audio books management
- `GET/PUT/DELETE /api/audio-books/[id]` - Single audio book operations
- `GET/POST /api/authors` - Authors management
- `GET/PUT/DELETE /api/authors/[id]` - Single author operations
- `GET /api/users` - Users list
- `GET/PUT /api/users/[id]` - User operations
- `GET /api/dashboard` - Dashboard statistics
- `POST /api/upload` - File upload (generate upload URL)
- `PUT /api/upload` - Direct file upload
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP

---

## ⚠️ IMPORTANT: Set Environment Variables

You **MUST** add these environment variables in Vercel Dashboard:

1. Go to: https://vercel.com/abhisheks-projects-19c6e9a3/admin/settings/environment-variables

2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://isndoxsyjbdzibhkrisj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODg4NTEsImV4cCI6MjA4MzE2NDg1MX0.xAhUBZ-5NCySy6QmF0DheBZaeFZRBBtnHRDHYcpQglo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU4ODg1MSwiZXhwIjoyMDgzMTY0ODUxfQ.QqqPY15EB75Dy2oDDKyzaDUMR5i9-wPbNDxa2rH-zqg
NEXT_PUBLIC_APP_URL=https://admin-orcin-omega.vercel.app
```

3. **After adding variables, redeploy**:
   ```bash
   cd admin
   vercel --prod
   ```

---

## 📱 Update Mobile App API URL

Update the mobile app to use the Vercel URL:

**File**: `mobile/src/services/api.js`

Change:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' // Development
  : 'https://your-production-url.com'; // Production
```

To:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' // Development (change to your local IP for physical device)
  : 'https://admin-orcin-omega.vercel.app'; // Production
```

---

## ✅ Deployment Status

- ✅ Admin Panel: Deployed
- ✅ API Routes: Deployed
- ⚠️ Environment Variables: **Need to be set in Vercel Dashboard**
- ⚠️ Mobile App: **Update API URL**

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/abhisheks-projects-19c6e9a3/admin
- **Deployment Logs**: https://vercel.com/abhisheks-projects-19c6e9a3/admin/deployments
- **Environment Variables**: https://vercel.com/abhisheks-projects-19c6e9a3/admin/settings/environment-variables

---

**Last Updated**: Deployment successful! 🎉

