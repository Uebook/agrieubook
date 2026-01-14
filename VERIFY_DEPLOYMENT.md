# 🔍 Verify Vercel Deployment

## Check What's Deployed vs What's Local

### Step 1: Verify Files Are Committed

```bash
cd /Users/vansh/ReactProject/Agribook

# Check if files are staged/committed
git status

# Check recent commits
git log --oneline -10
```

### Step 2: Check if Files Are Pushed

```bash
# Check if local is ahead of remote
git status

# If it says "Your branch is ahead of 'origin/main'", you need to push:
git push origin main
```

### Step 3: Verify Route Files Exist

Check these files exist and are committed:

```bash
# Check FCM token route
ls -la admin/app/api/users/fcm-token/route.ts

# Check notifications push route
ls -la admin/app/api/notifications/push/route.ts

# Check users all route
ls -la admin/app/api/users/all/route.ts

# Check notifications page
ls -la admin/app/notifications/page.tsx

# Check sidebar
ls -la admin/components/Sidebar.tsx
```

### Step 4: Test Live Endpoints

#### Test 1: FCM Token Endpoint (GET)
```bash
curl https://admin-orcin-omega.vercel.app/api/users/fcm-token
```

**Expected:** `{"success":true,"message":"FCM token endpoint is accessible",...}`

**If 404 or 405:** Route not deployed

#### Test 2: FCM Token Endpoint (POST)
```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/users/fcm-token \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","fcm_token":"test-token"}'
```

**Expected:** Success or user not found (not 405)

#### Test 3: Users All Endpoint
```bash
curl https://admin-orcin-omega.vercel.app/api/users/all?limit=10
```

**Expected:** JSON with users array

#### Test 4: Notifications Page
Visit: https://admin-orcin-omega.vercel.app/notifications

**Expected:** Page loads with sidebar and header

## Common Issues

### Issue 1: Files Not Committed

**Solution:**
```bash
git add admin/app/api/users/fcm-token/
git add admin/app/api/users/all/
git add admin/app/api/notifications/push/
git add admin/app/notifications/
git add admin/components/Sidebar.tsx
git add admin/lib/firebase/
git commit -m "Deploy Firebase notifications system"
git push
```

### Issue 2: Files Committed But Not Pushed

**Solution:**
```bash
git push origin main
```

### Issue 3: Vercel Build Failing

**Check:**
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Check build logs for errors
4. Look for TypeScript/ESLint errors

### Issue 4: Route Not Found (404/405)

**Possible causes:**
1. Route file not in correct location
2. Next.js not recognizing route
3. Build failed silently

**Solution:**
1. Verify file path: `admin/app/api/users/fcm-token/route.ts`
2. Check Vercel function logs
3. Redeploy manually

## Force Redeploy

If changes aren't showing up:

```bash
# Make a small change to trigger redeploy
cd /Users/vansh/ReactProject/Agribook/admin
echo "// Deploy trigger $(date)" >> app/api/users/fcm-token/route.ts

git add .
git commit -m "Trigger redeploy"
git push
```

Or use Vercel Dashboard:
1. Go to Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"

## Verify Deployment Checklist

- [ ] All files committed to git
- [ ] Changes pushed to remote repository
- [ ] Vercel build completed successfully
- [ ] GET /api/users/fcm-token returns JSON (not 404/405)
- [ ] POST /api/users/fcm-token works (test with curl)
- [ ] /notifications page loads with sidebar
- [ ] Sidebar shows notifications link

## Quick Test Script

```bash
#!/bin/bash
echo "Testing Vercel Deployment..."

echo "1. Testing FCM Token GET..."
curl -s https://admin-orcin-omega.vercel.app/api/users/fcm-token

echo -e "\n\n2. Testing FCM Token POST..."
curl -s -X POST https://admin-orcin-omega.vercel.app/api/users/fcm-token \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","fcm_token":"test"}'

echo -e "\n\n3. Testing Users All..."
curl -s https://admin-orcin-omega.vercel.app/api/users/all?limit=5

echo -e "\n\nDone!"
```

---

**Run the tests above to see what's working and what's not!** 🔍
