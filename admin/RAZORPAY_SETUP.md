# Razorpay Payment Integration Setup

## Test Keys Configuration

The Razorpay integration is configured with test keys. To use it:

### 1. Get Your Razorpay Test Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or login
3. Go to **Settings** → **API Keys**
4. Generate **Test Keys** (or use existing ones)
5. Copy the **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Add these to your `.env.local` file in the `admin` directory:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
```

### 3. Default Test Keys (for testing)

The code includes a default test key ID: `rzp_test_1DP5mmOlF5G5ag`

**Important**: Replace `YOUR_RAZORPAY_TEST_SECRET_KEY` in the code with your actual test secret key.

### 4. Files to Update

1. **`admin/app/api/payments/razorpay/order/route.ts`**:
   - Replace `'YOUR_RAZORPAY_TEST_SECRET_KEY'` with your actual secret key
   - Or set `RAZORPAY_KEY_SECRET` environment variable

2. **`admin/app/api/payments/razorpay/verify/route.ts`**:
   - Replace `'YOUR_RAZORPAY_TEST_SECRET_KEY'` with your actual secret key
   - Or set `RAZORPAY_KEY_SECRET` environment variable

### 5. Mobile App Configuration

The mobile app uses the Razorpay key ID: `rzp_test_1DP5mmOlF5G5ag`

To change it, update `RAZORPAY_KEY_ID` in:
- `mobile/src/screens/main/PaymentScreen.js`

## Payment Flow

1. User clicks "Buy Now" on a book
2. App creates a Razorpay order via `/api/payments/razorpay/order`
3. Razorpay checkout opens
4. User completes payment
5. Payment is verified via `/api/payments/razorpay/verify`
6. Purchase record is created in `payments` table
7. Book is added to user's library

## Testing

Use Razorpay test cards:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

## Production

For production:
1. Switch to **Live Keys** in Razorpay Dashboard
2. Update environment variables with live keys
3. Update mobile app with live key ID
