# ⚠️ Razorpay Authentication Failed - Fix Guide

## Current Issue

The Razorpay API is returning "Authentication failed" which means the credentials are incorrect or don't match.

## Quick Fix Steps

### 1. Verify Your Razorpay Credentials

1. Go to **Razorpay Dashboard**: https://dashboard.razorpay.com/
2. Login to your account
3. Go to **Settings** → **API Keys**
4. Make sure you're looking at **Test Keys** (not Live Keys)
5. **Copy the exact Key ID and Key Secret**

### 2. Update Vercel Environment Variables

1. Go to: https://vercel.com/abhisheks-projects-19c6e9a3/admin/settings/environment-variables
2. **Delete** the existing `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` variables
3. **Add new ones** with the correct values:
   - **Key**: `RAZORPAY_KEY_ID`
     **Value**: Your actual test key ID (starts with `rzp_test_`)
     **Environments**: ✅ Production, ✅ Preview, ✅ Development
   
   - **Key**: `RAZORPAY_KEY_SECRET`
     **Value**: Your actual test secret key (exact copy from dashboard)
     **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 3. Important Notes

- **Key ID and Secret must match** - They must be from the same Razorpay account
- **Use Test Keys** - Make sure you're using test keys, not live keys
- **No extra spaces** - Copy the keys exactly, no leading/trailing spaces
- **Case sensitive** - The keys are case-sensitive

### 4. Redeploy

After updating the variables, **you MUST redeploy**:

```bash
cd admin
vercel --prod
```

Or trigger redeploy from Vercel Dashboard:
- Go to **Deployments** tab
- Click **"..."** on latest deployment
- Click **"Redeploy"**

### 5. Test Again

After redeployment, test the payment again. The error should be resolved.

## Common Mistakes

❌ **Wrong**: Using Key ID from one account with Secret from another
✅ **Correct**: Use Key ID and Secret from the same Razorpay account

❌ **Wrong**: Using Live keys instead of Test keys
✅ **Correct**: Use Test keys for development/testing

❌ **Wrong**: Adding spaces or extra characters
✅ **Correct**: Copy keys exactly as shown in dashboard

❌ **Wrong**: Not redeploying after updating variables
✅ **Correct**: Always redeploy after changing environment variables

## Still Not Working?

If you still get authentication errors after following these steps:

1. **Double-check** the credentials in Razorpay Dashboard
2. **Verify** they're set correctly in Vercel (check for typos)
3. **Make sure** you redeployed after updating
4. **Check** Vercel logs for more details:
   ```bash
   vercel logs https://admin-orcin-omega.vercel.app
   ```

## Need New Credentials?

If your credentials are lost or incorrect:

1. Go to Razorpay Dashboard → Settings → API Keys
2. Click **"Reset"** or **"Generate New Keys"**
3. Copy the new Key ID and Secret
4. Update in Vercel and redeploy
