# 🚀 Deploy to Vercel - Run These Commands

## Copy and paste these commands in your terminal:

```bash
cd /Users/vansh/ReactProject/Agribook

# Stage all admin panel changes
git add admin/app/api/users/fcm-token/
git add admin/app/api/users/all/
git add admin/app/api/notifications/push/
git add admin/app/notifications/
git add admin/components/Sidebar.tsx
git add admin/lib/firebase/
git add admin/lib/utils/notifications.ts
git add admin/package.json
git add admin/database/add_fcm_token.sql
git add admin/database/add_notification_fields.sql

# Stage documentation
git add FIREBASE_SETUP.md FIREBASE_IMPLEMENTATION_SUMMARY.md DEPLOY_CHECKLIST.md QUICK_DEPLOY.md
git add FIX_405_ERROR.md FIX_NOTIFICATIONS_AND_FCM.md
git add admin/DEPLOY_TO_VERCEL.md admin/VERCEL_FIREBASE_SETUP.md admin/DEPLOY_NOTIFICATIONS_UPDATE.md admin/TEST_FCM_TOKEN.md

# Commit
git commit -m "Deploy: Complete Firebase notifications system

- FCM token API with CORS support
- User selection API
- Push notification API with image/description
- Enhanced notifications page
- Sidebar notifications link
- Firebase Admin SDK integration
- Fixed local API URL issues"

# Push to trigger Vercel deployment
git push origin main
```

## After Pushing:

1. **Check Vercel Dashboard**: https://vercel.com/dashboard
2. **Wait for build** (usually 2-5 minutes)
3. **Run database migrations** in Supabase (see below)
4. **Test the deployment**

## Database Migrations (Run in Supabase SQL Editor):

```sql
-- Migration 1: FCM Token columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fcm_token_updated_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON users(fcm_token) WHERE fcm_token IS NOT NULL;

-- Migration 2: Notification fields
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

## Verify Deployment:

1. **Notifications Page**: https://admin-orcin-omega.vercel.app/notifications
2. **Sidebar**: Check for "🔔 Notifications" link
3. **FCM Token API**: 
   ```bash
   curl -X POST https://admin-orcin-omega.vercel.app/api/users/fcm-token \
     -H "Content-Type: application/json" \
     -d '{"user_id":"test","fcm_token":"test"}'
   ```

---

**Run the commands above to deploy!** 🚀
