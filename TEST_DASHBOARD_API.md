# 🧪 Test Dashboard API Locally

## Quick Test

1. **Start your dev server:**
   ```bash
   cd /Users/vansh/ReactProject/Agribook/admin
   npm run dev
   ```

2. **Open browser console** (F12) and go to Dashboard page

3. **Check the console logs** - You should see:
   ```
   📊 Dashboard API - All payments fetched: X
   📊 Total payments from query: X
   📊 Payments with book_id or audio_book_id: X
   ```

4. **Or test the API directly:**
   ```bash
   curl http://localhost:3000/api/dashboard
   ```

## Expected Output

If working correctly, you should see:
- `totalPayments: 2` (matching Purchases page)
- `totalRevenue: 111` (₹100 + ₹11)

## If Still Showing 0

Check the console logs for:
- How many payments were fetched from the query
- How many have book_id or audio_book_id
- Sample payment data

This will tell us exactly what's wrong!
