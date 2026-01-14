#!/bin/bash

# Deploy Latest Fixes to Vercel
# This script commits and pushes all the latest fixes

set -e

cd /Users/vansh/ReactProject/Agribook

echo "🚀 Deploying Latest Fixes to Vercel..."
echo ""

# Add all modified admin files
echo "📦 Staging modified files..."
git add admin/app/api/users/fcm-token/route.ts
git add admin/app/notifications/page.tsx
git add admin/components/Sidebar.tsx
git add admin/lib/firebase/admin.ts
git add admin/lib/utils/notifications.ts
git add admin/app/api/notifications/push/route.ts
git add admin/app/api/users/all/route.ts

# Add new files if they exist
if [ -f "admin/app/api/users/fcm-token/test/route.ts" ]; then
  git add admin/app/api/users/fcm-token/test/route.ts
fi

# Add documentation
git add VERIFY_DEPLOYMENT.md DEPLOY_NOW.md QUICK_DEPLOY.md TEST_FCM_ENDPOINT.md URGENT_FIX_405.md

echo ""
echo "📋 Files to be committed:"
git status --short

echo ""
echo "💾 Committing changes..."
git commit -m "Fix: Deploy latest Firebase and notifications fixes

- Fix FCM token API with CORS and GET test endpoint
- Add Header and Sidebar to notifications page
- Fix local API URL for notifications
- Add comprehensive error handling and logging
- Ensure all routes are properly exported"

echo ""
echo "🚀 Pushing to repository (triggers Vercel deployment)..."
git push origin main

echo ""
echo "✅ Deployment triggered!"
echo ""
echo "⏳ Wait 2-5 minutes for Vercel to build and deploy"
echo ""
echo "📋 Then test:"
echo "1. GET: curl https://admin-orcin-omega.vercel.app/api/users/fcm-token"
echo "2. POST: curl -X POST https://admin-orcin-omega.vercel.app/api/users/fcm-token -H 'Content-Type: application/json' -d '{\"user_id\":\"test\",\"fcm_token\":\"test\"}'"
echo "3. Page: https://admin-orcin-omega.vercel.app/notifications"
echo ""
echo "🎉 Check Vercel Dashboard for build status!"
