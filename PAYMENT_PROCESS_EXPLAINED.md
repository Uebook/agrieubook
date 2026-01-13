# Payment Process with Subscription Logic - Explained

## Overview

There are **3 different payment/access scenarios** in the system:

1. **Subscription Payment** - User pays for monthly subscription
2. **Direct Book Purchase** - User pays for a paid author book
3. **Subscription-Based Access** - User accesses free/platform content using existing subscription (no payment)

---

## 1. Subscription Payment Flow

**When:** User subscribes to a monthly plan from SubscriptionScreen

**Payment Flow:**
```
User clicks "Subscribe" 
  ↓
Razorpay Checkout opens (amount = subscription.price)
  ↓
User pays via Razorpay
  ↓
Payment Success → Create payment record in `payments` table:
  - user_id
  - amount: subscription.price
  - payment_method: 'razorpay'
  - transaction_id: razorpay_payment_id
  - subscription_type_id: subscription.id  ← KEY: Links to subscription
  - book_id: NULL
  - audio_book_id: NULL
  ↓
Activate subscription in `user_subscriptions` table:
  - user_id
  - subscription_type_id
  - status: 'active'
  - start_date: NOW()
  - end_date: NOW() + duration_days
  - payment_id: (payment record ID)
  ↓
User now has active subscription
```

**Database Records Created:**
- ✅ 1 record in `payments` table (with `subscription_type_id`)
- ✅ 1 record in `user_subscriptions` table (active subscription)

**Result:** User can now:
- ✅ Access the app
- ✅ Access all free/platform content
- ❌ **Still needs to purchase paid author books separately**

---

## 2. Direct Book Purchase Flow

**When:** User wants to buy a **Paid Author Book**

**Payment Flow:**
```
User clicks "Buy Now" on Paid Author Book
  ↓
PaymentScreen opens
  ↓
Razorpay Checkout opens (amount = book.price)
  ↓
User pays via Razorpay
  ↓
Payment Success → Create payment record in `payments` table:
  - user_id
  - amount: book.price
  - payment_method: 'razorpay'
  - transaction_id: razorpay_payment_id
  - subscription_type_id: NULL  ← KEY: No subscription link
  - book_id: book.id  ← KEY: Links to book
  - audio_book_id: NULL
  ↓
Book added to user's library
```

**Database Records Created:**
- ✅ 1 record in `payments` table (with `book_id`, NO `subscription_type_id`)

**Result:** User owns this specific book permanently

---

## 3. Subscription-Based Access Flow (No Payment)

**When:** User with active subscription wants to access **Free/Platform Content**

**Access Flow:**
```
User clicks "Read" on Free/Platform Content
  ↓
System checks: Does user have active subscription?
  ↓
YES → Create payment record in `payments` table:
  - user_id
  - amount: 0  ← KEY: No payment, just access record
  - payment_method: 'subscription'  ← KEY: Marks as subscription access
  - transaction_id: 'SUB-{timestamp}'  ← Generated ID, not real payment
  - subscription_type_id: NULL  ← No subscription payment, just using subscription
  - book_id: book.id  ← Links to the content accessed
  - audio_book_id: NULL
  ↓
Content added to user's library
```

**Database Records Created:**
- ✅ 1 record in `payments` table (with `payment_method: 'subscription'`, `amount: 0`)

**Result:** User can access this content while subscription is active

**Important Notes:**
- ❌ **No Razorpay payment** - This is just an access record
- ❌ **No money charged** - User already paid for subscription
- ✅ **Creates library entry** - So content appears in user's library
- ⚠️ **Access expires** - If subscription expires, access is revoked

---

## Payment Table Structure

The `payments` table stores all payment/access records:

```sql
payments {
  id: UUID
  user_id: UUID
  amount: DECIMAL
  payment_method: VARCHAR  -- 'razorpay' or 'subscription'
  transaction_id: VARCHAR   -- Razorpay payment ID or 'SUB-{timestamp}'
  status: VARCHAR           -- 'completed'
  
  -- ONE of these will be set:
  book_id: UUID             -- If accessing a book
  audio_book_id: UUID       -- If accessing an audio book
  subscription_type_id: UUID -- If paying for subscription (NOT for accessing content)
}
```

### Payment Record Examples:

**1. Subscription Payment:**
```json
{
  "user_id": "user-123",
  "amount": 299.00,
  "payment_method": "razorpay",
  "transaction_id": "pay_abc123xyz",
  "subscription_type_id": "sub-monthly-1",  ← Subscription purchase
  "book_id": null,
  "audio_book_id": null
}
```

**2. Direct Book Purchase:**
```json
{
  "user_id": "user-123",
  "amount": 150.00,
  "payment_method": "razorpay",
  "transaction_id": "pay_def456uvw",
  "subscription_type_id": null,
  "book_id": "book-789",  ← Book purchase
  "audio_book_id": null
}
```

**3. Subscription-Based Access:**
```json
{
  "user_id": "user-123",
  "amount": 0.00,  ← No payment
  "payment_method": "subscription",  ← Access via subscription
  "transaction_id": "SUB-1234567890",
  "subscription_type_id": null,  ← Not a subscription payment
  "book_id": "book-free-123",  ← Content accessed
  "audio_book_id": null
}
```

---

## Key Differences

| Aspect | Subscription Payment | Direct Book Purchase | Subscription Access |
|--------|---------------------|---------------------|---------------------|
| **When** | User subscribes | User buys paid book | User accesses free content |
| **Razorpay Payment** | ✅ Yes | ✅ Yes | ❌ No |
| **Amount** | Subscription price | Book price | ₹0 |
| **payment_method** | 'razorpay' | 'razorpay' | 'subscription' |
| **subscription_type_id** | ✅ Set (subscription ID) | ❌ NULL | ❌ NULL |
| **book_id** | ❌ NULL | ✅ Set (book ID) | ✅ Set (book ID) |
| **Creates user_subscription** | ✅ Yes | ❌ No | ❌ No |
| **Access Duration** | Until subscription expires | Permanent | Until subscription expires |

---

## Access Control Logic

### For Paid Author Books:
```javascript
if (book.author_id && !book.is_free && book.price > 0) {
  // Check if purchased
  const purchased = checkPayments(user_id, book_id, payment_method: 'razorpay');
  if (purchased) {
    // Allow access
  } else {
    // Show "Buy Now" button
  }
}
```

### For Free/Platform Content:
```javascript
if (book.is_free || !book.author_id) {
  // Check if user has active subscription
  const hasSubscription = checkUserSubscriptions(user_id, status: 'active');
  if (hasSubscription) {
    // Allow access (create subscription access record)
    createPaymentRecord(user_id, book_id, payment_method: 'subscription', amount: 0);
  } else {
    // Show "Subscribe to Access" button
  }
}
```

---

## Summary

1. **Subscription Payment** = User pays money → Gets subscription → Can access app + free content (paid books still need purchase)
2. **Direct Book Purchase** = User pays money → Owns specific paid author book permanently
3. **Subscription Access** = User uses existing subscription → Gets free content (no payment)

## Important Clarification

**Subscription does NOT include paid author books:**
- ✅ Subscription = Access to app + Free/Platform Content
- ❌ Subscription ≠ Access to paid author books
- 💰 Paid author books must be purchased separately, even with active subscription

The `payments` table is used for:
- ✅ Recording subscription payments
- ✅ Recording book purchases
- ✅ Recording subscription-based access (for library tracking)

The `user_subscriptions` table tracks:
- ✅ Active subscriptions
- ✅ Subscription expiry dates
- ✅ Which subscription plan user has
