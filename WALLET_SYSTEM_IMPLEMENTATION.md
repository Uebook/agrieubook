# Author Wallet System Implementation

## Overview

Complete wallet system for authors with commission calculation, GST handling, and withdrawal management.

## Features Implemented

### 1. Database Schema
- **author_wallet** table: Tracks author balance, total earnings, and withdrawals
- **withdrawal_requests** table: Manages withdrawal requests with bank/UPI details
- **author_payment_history** table: Detailed history of all author earnings
- **payments** table: Extended with commission, GST, and author earnings fields

### 2. Commission & GST Calculation

**Formula:**
```
User pays: ₹100 (gross amount)
GST (18%): ₹100 × 0.18 = ₹18
Net amount: ₹100 - ₹18 = ₹82
Platform commission (30%): ₹82 × 0.30 = ₹24.60
Author earnings (70%): ₹82 × 0.70 = ₹57.40
```

**Applied to:**
- Paid author books (author_id exists, is_free = false, price > 0)
- Paid author audio books

**Not applied to:**
- Free books
- Platform content (no author_id)
- Subscription payments

### 3. API Endpoints

#### `/api/wallet` (GET)
- Get wallet balance and summary
- Returns: balance, total_earnings, total_withdrawn, recent payments, pending withdrawals

#### `/api/wallet/history` (GET)
- Get payment or withdrawal history
- Parameters: `author_id`, `type` (payments/withdrawals), `page`, `limit`

#### `/api/wallet/withdraw` (POST)
- Create withdrawal request
- Supports bank transfer and UPI
- Validates balance and prevents duplicate pending requests

### 4. Mobile App

#### WalletScreen
- **Balance Card**: Shows available balance, total earnings, total withdrawn
- **Withdrawal Button**: Opens modal to request withdrawal
- **Tabs**: Overview, Payments, Withdrawals
- **Payment History**: Shows all book sales with commission breakdown
- **Withdrawal History**: Shows all withdrawal requests with status

#### Navigation
- Added to ProfileScreen menu for authors
- Accessible via "My Wallet" option

### 5. Admin Dashboard

#### Updated Metrics
- `totalPlatformCommission`: Total commission earned
- `totalGST`: Total GST collected
- `totalAuthorEarnings`: Total paid to authors
- `platformProfit`: Net platform profit (commission)

#### Dashboard API Response
```json
{
  "totalRevenue": 10000,
  "totalPlatformCommission": 2460,
  "totalGST": 1800,
  "totalAuthorEarnings": 5740,
  "platformProfit": 2460
}
```

## Database Triggers

### Auto Wallet Update
- When payment is completed with `author_id`, automatically:
  - Creates/updates `author_wallet`
  - Adds earnings to balance
  - Records in `author_payment_history`

### Withdrawal Processing
- When withdrawal status changes to "completed":
  - Deducts from wallet balance
  - Updates total_withdrawn

## Usage Flow

### 1. Book Purchase
```
User buys book (₹100)
  ↓
Payment API calculates:
  - GST: ₹18
  - Net: ₹82
  - Commission: ₹24.60
  - Author earnings: ₹57.40
  ↓
Payment record created with all fields
  ↓
Trigger updates author_wallet automatically
  ↓
Author balance increases by ₹57.40
```

### 2. Author Withdrawal
```
Author requests withdrawal (₹50)
  ↓
System validates:
  - Balance available
  - No pending requests
  ↓
Withdrawal request created (status: pending)
  ↓
Admin approves → Status: completed
  ↓
Trigger deducts from wallet balance
  ↓
Author receives payment
```

## Files Created/Modified

### Database
- `admin/database/add_wallet_system.sql` - Complete wallet schema

### Backend APIs
- `admin/app/api/purchase/route.ts` - Updated with commission/GST calculation
- `admin/app/api/wallet/route.ts` - Wallet balance endpoint
- `admin/app/api/wallet/history/route.ts` - Payment/withdrawal history
- `admin/app/api/wallet/withdraw/route.ts` - Withdrawal request
- `admin/app/api/dashboard/route.ts` - Added commission/profit metrics

### Mobile App
- `mobile/src/screens/main/WalletScreen.js` - Complete wallet UI
- `mobile/src/services/api.js` - Added wallet API methods
- `mobile/src/navigation/MainStack.js` - Added WalletScreen route
- `mobile/src/screens/main/ProfileScreen.js` - Added wallet menu item

## Next Steps (Admin Panel)

1. **Withdrawal Management Page**: Create admin page to approve/reject withdrawals
2. **Dashboard UI Update**: Display commission and profit metrics
3. **Payment Reports**: Detailed reports with commission breakdown

## Testing Checklist

- [ ] Book purchase calculates commission correctly
- [ ] GST is deducted properly
- [ ] Author wallet updates automatically
- [ ] Withdrawal request validation works
- [ ] Balance check prevents over-withdrawal
- [ ] Payment history shows correct breakdown
- [ ] Dashboard shows commission/profit
- [ ] Mobile wallet screen displays correctly
