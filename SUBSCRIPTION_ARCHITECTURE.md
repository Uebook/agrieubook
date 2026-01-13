# Subscription + Author Payment Architecture

## Overview

The platform now implements a clear separation between **Paid Author Books** and **Free/Platform Content**:

### Architecture Rules

1. **Paid Books (Author Books) = Direct Buy Only**
   - Books with `author_id IS NOT NULL` AND `is_free = false` AND `price > 0`
   - **Cannot** be accessed via subscription
   - **Must** be purchased directly
   - Subscription does **NOT** grant access to these books
   - **Even with active subscription, user must purchase paid books separately**

2. **Free / Platform Content = Subscription Only**
   - Books with `is_free = true` OR `author_id IS NULL`
   - **Cannot** be purchased directly
   - **Requires** active subscription to access
   - Direct purchase is blocked
   - Subscription grants access to app + all free/platform content

## Implementation Details

### Mobile App Changes

#### PaymentScreen.js
- **Paid Author Books**: Only allows direct payment (Razorpay)
- **Free/Platform Content**: 
  - Checks for active subscription
  - If no subscription → Redirects to Subscription screen
  - If subscription active → Grants access via subscription payment method

#### BookDetailScreen.js
- **Paid Author Books**:
  - Shows "Buy Now" if not purchased
  - Shows "Read" if purchased
  - No subscription check
- **Free/Platform Content**:
  - Shows "Subscribe to Access" if no subscription
  - Shows "Read (Subscription)" if subscription active

#### ReaderScreen.js
- **Paid Author Books**: Checks purchase status only
- **Free/Platform Content**: Checks subscription status only
- Shows appropriate error messages if access denied

### Backend API Changes

#### `/api/purchase` (POST)
- **Validation Rules**:
  - Paid Author Books: Rejects `payment_method = 'subscription'`
  - Free/Platform Content: Rejects direct purchase (requires `payment_method = 'subscription'`)
  - Free/Platform Content: Verifies active subscription before granting access

## Book Type Detection

```javascript
// Paid Author Book
const isPaidAuthorBook = book.author_id && !book.is_free && book.price > 0;

// Free/Platform Content
const isFreeOrPlatformContent = book.is_free || !book.author_id;
```

## User Flow Examples

### Scenario 1: User wants to read Paid Author Book
1. User clicks "Buy Now" on book detail
2. PaymentScreen opens
3. User pays via Razorpay
4. Book added to library
5. User can read the book

### Scenario 2: User wants to read Free/Platform Content
1. User clicks "Subscribe to Access" on book detail
2. SubscriptionScreen opens
3. User subscribes to monthly plan
4. User returns to book detail
5. "Read (Subscription)" button appears
6. User can read the content

### Scenario 3: User with subscription tries to access Paid Author Book
1. User has active subscription
2. User clicks on Paid Author Book
3. "Buy Now" button shown (subscription doesn't apply)
4. User must purchase directly

## Database Schema

No schema changes required. Uses existing fields:
- `books.author_id` - NULL = platform content, NOT NULL = author book
- `books.is_free` - true = free content
- `books.price` - > 0 = paid book

## Testing Checklist

- [ ] Paid Author Book: Direct purchase works
- [ ] Paid Author Book: Subscription access is blocked
- [ ] Free/Platform Content: Subscription access works
- [ ] Free/Platform Content: Direct purchase is blocked
- [ ] BookDetailScreen shows correct buttons
- [ ] ReaderScreen enforces access rules
- [ ] PaymentScreen redirects correctly
- [ ] Library shows purchased books correctly
