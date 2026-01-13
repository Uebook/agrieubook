# Subscription Model Clarification

## What Subscription Includes

✅ **Subscription gives you:**
- Access to the app
- Access to all **free books** and **platform content**
- Unlimited reading of free content during subscription period

❌ **Subscription does NOT include:**
- Paid author books (must be purchased separately)
- Any books with price > 0 that have an author_id

## How It Works

### Scenario 1: User with Subscription
- ✅ Can access app
- ✅ Can read all free/platform content
- ❌ Still needs to **buy** paid author books (subscription doesn't help)

### Scenario 2: User without Subscription
- ❌ Cannot access free/platform content
- ✅ Can still **buy** paid author books directly
- 💡 Subscription is optional - only needed for free content

## Payment Flow

1. **Subscription Payment** (₹299/month example)
   - User pays → Gets subscription → Can access free content
   - **Does NOT** unlock paid books

2. **Book Purchase** (₹150/book example)
   - User pays → Owns that specific book
   - Works with or without subscription
   - Subscription status doesn't matter for paid books

## User Experience

### On Book Detail Screen:

**For Paid Author Book:**
- Shows "Buy Now" button (always)
- Subscription status doesn't change this
- User must purchase to read

**For Free/Platform Content:**
- Without subscription: Shows "Subscribe to Access"
- With subscription: Shows "Read (Subscription)"
- Cannot purchase directly

## Key Message

> **"Subscription unlocks the app and free content. Paid books are always purchased separately."**
