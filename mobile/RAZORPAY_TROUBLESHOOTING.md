# Razorpay SDK Troubleshooting Guide

## Issue: Razorpay SDK Not Opening

If the Razorpay payment screen is not opening, check the following:

### 1. Check Console Logs

Look for these log messages in your React Native debugger:

- `📦 Creating Razorpay order with:` - Order creation started
- `✅ Order created successfully:` - Order created (check for orderId)
- `💳 Opening Razorpay native checkout screen with options:` - About to open SDK
- `✅ RazorpayCheckout is available, opening checkout...` - SDK is ready
- `✅ Payment success data:` - Payment completed

### 2. Common Issues and Solutions

#### Issue A: Order Creation Failing

**Symptoms:**
- Error: "Payment initiation error: Failed to create payment order"
- Error: "Razorpay authentication failed"

**Solution:**
1. Check if Razorpay credentials are set in Vercel:
   - Go to: https://vercel.com/abhisheks-projects-19c6e9a3/admin/settings/environment-variables
   - Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
   - Make sure they're enabled for **Production** environment

2. Verify credentials are correct:
   - Key ID should start with `rzp_test_` for test mode
   - Secret key should match the key ID

3. Redeploy after setting variables:
   ```bash
   cd admin
   vercel --prod
   ```

#### Issue B: SDK Not Available

**Symptoms:**
- Error: "Razorpay SDK is not properly initialized"
- Error: "RazorpayCheckout.open is not a function"

**Solution:**
1. Reinstall the package:
   ```bash
   cd mobile
   npm install react-native-razorpay
   ```

2. For Android, rebuild the app:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. For iOS, rebuild:
   ```bash
   cd ios
   pod install
   cd ..
   npx react-native run-ios
   ```

#### Issue C: Native Module Not Linked

**Symptoms:**
- App crashes when opening payment
- "Native module not found" error

**Solution:**
1. React Native 0.60+ should auto-link, but if not:
   ```bash
   cd mobile
   npx react-native link react-native-razorpay
   ```

2. Rebuild the app completely:
   ```bash
   # Android
   cd android && ./gradlew clean && cd ..
   npx react-native run-android
   
   # iOS
   cd ios && pod install && cd ..
   npx react-native run-ios
   ```

### 3. Testing Steps

1. **Check Order Creation:**
   - Open React Native debugger
   - Click "Pay Now" on a book
   - Look for "✅ Order created successfully" in console
   - Verify `orderId` is present

2. **Check SDK Opening:**
   - After order creation, look for "✅ RazorpayCheckout is available"
   - The Razorpay screen should open automatically
   - If not, check for error messages

3. **Test Payment:**
   - Use test card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

### 4. Debug Checklist

- [ ] Razorpay package is installed: `npm list react-native-razorpay`
- [ ] App is rebuilt after installing package
- [ ] Order creation API is working (check network tab)
- [ ] Razorpay credentials are set in Vercel
- [ ] Vercel deployment is updated with credentials
- [ ] Console shows order creation success
- [ ] No errors in React Native debugger
- [ ] App has internet connection

### 5. Manual Testing

Test the order creation API directly:

```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/payments/razorpay/order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 11,
    "bookId": "test-book",
    "userId": "test-user"
  }'
```

Expected response:
```json
{
  "orderId": "order_xxxxx",
  "amount": 1100,
  "currency": "INR",
  "key": "rzp_test_..."
}
```

If this fails, the issue is with the backend/credentials, not the SDK.

### 6. Still Not Working?

1. **Clear cache and rebuild:**
   ```bash
   cd mobile
   npm start -- --reset-cache
   # In another terminal:
   npx react-native run-android
   ```

2. **Check Android permissions:**
   - Ensure `INTERNET` permission is in `AndroidManifest.xml`

3. **Check iOS Info.plist:**
   - Ensure network permissions are set

4. **Check logs:**
   ```bash
   # Android
   adb logcat | grep -i razorpay
   
   # iOS
   # Check Xcode console
   ```

### 7. Contact Support

If none of the above works, provide:
- Full console logs from React Native debugger
- Error messages (if any)
- Platform (Android/iOS)
- React Native version
- Steps to reproduce
