# 🔧 Quick Fix: Razorpay Setup on Vercel

## The Error You're Seeing

If you see: **"Payment initiation error: Failed to create payment order"**

This means the Razorpay secret key is not configured in Vercel.

## Quick Setup Steps

### 1. Get Your Razorpay Test Keys

1. Go to https://dashboard.razorpay.com/
2. Login or Sign Up
3. Go to **Settings** → **API Keys**
4. Copy your **Test Key ID** and **Test Key Secret**

### 2. Add Environment Variables in Vercel

1. **Go to Vercel Dashboard**: 
   https://vercel.com/abhisheks-projects-19c6e9a3/admin/settings/environment-variables

2. **Click "Add New"** and add:

   **Variable 1:**
   - **Key**: `RAZORPAY_KEY_ID`
   - **Value**: `rzp_test_YOUR_KEY_ID` (paste your actual test key ID)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - **Key**: `RAZORPAY_KEY_SECRET`
   - **Value**: `YOUR_SECRET_KEY` (paste your actual test secret key)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

3. **Click "Save"** for each variable

### 3. Redeploy

After adding the variables, you **MUST redeploy** for them to take effect:

```bash
cd admin
vercel --prod
```

Or trigger a redeploy from Vercel Dashboard:
- Go to **Deployments** tab
- Click **"..."** on the latest deployment
- Click **"Redeploy"**

### 4. Test Payment

After redeployment, try the payment again. The error should be resolved.

## Verification

To verify the variables are set:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. You should see both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` listed
3. Make sure they're enabled for **Production** environment

## Still Having Issues?

If you still see errors after setting the variables and redeploying:

1. **Check the variable names** - they must be exactly:
   - `RAZORPAY_KEY_ID` (not `RAZORPAY_KEY` or `RAZORPAY_ID`)
   - `RAZORPAY_KEY_SECRET` (not `RAZORPAY_SECRET`)

2. **Check the values** - make sure:
   - Key ID starts with `rzp_test_` for test keys
   - Secret key is the full secret (not truncated)

3. **Verify redeployment** - check the deployment logs to ensure the build completed successfully

4. **Check Vercel logs**:
   ```bash
   vercel logs https://admin-orcin-omega.vercel.app
   ```

## Need Help?

See the full setup guide: `admin/RAZORPAY_SETUP.md`
