# Profile Update API Testing Guide

## API Endpoint

**URL:** `https://admin-orcin-omega.vercel.app/api/profile/update`

**Methods:** `POST` or `PUT` (both supported)

**Content-Type:** `multipart/form-data` (for FormData with file upload)

---

## Parameters

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `user_id` | UUID String | User ID in UUID format (required if `author_id` not provided) | `550e8400-e29b-41d4-a716-446655440000` |
| `author_id` | UUID String | Author ID in UUID format (alternative to `user_id`) | `550e8400-e29b-41d4-a716-446655440000` |

**Note:** 
- Either `user_id` OR `author_id` must be provided.
- **IMPORTANT:** Both `user_id` and `author_id` must be in **UUID format** (e.g., `550e8400-e29b-41d4-a716-446655440000`), not plain numbers like `1231`.
- To get a valid user ID, query your users table in Supabase or use the `/api/users` endpoint.

### Optional Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `full_name` | Text | User's full name | `John Doe` |
| `email` | Text | User's email address | `john@example.com` |
| `phone` | Text | User's phone number | `+1234567890` |
| `address` | Text | User's address | `123 Main St, City` |
| `bio` | Text | User's biography | `Software developer...` |
| `city` | Text | User's city | `New York` |
| `state` | Text | User's state | `NY` |
| `pincode` | Text | User's postal code | `10001` |
| `website` | Text | User's website URL | `https://johndoe.com` |
| `profile_picture` | File | Profile picture image file | `image.jpg` |

---

## Testing with Postman

### Setup

1. **Method:** `POST` or `PUT`
2. **URL:** `https://admin-orcin-omega.vercel.app/api/profile/update`
3. **Body Type:** Select `form-data`

### Form Data Fields

Add the following fields:

#### Without Profile Picture

```
Key: user_id
Type: Text
Value: 550e8400-e29b-41d4-a716-446655440000
(Note: Must be a valid UUID, not a plain number)

Key: full_name
Type: Text
Value: John Doe

Key: email
Type: Text
Value: john@example.com

Key: phone
Type: Text
Value: +1234567890

Key: address
Type: Text
Value: 123 Main Street

Key: bio
Type: Text
Value: Software developer and book author

Key: city
Type: Text
Value: New York

Key: state
Type: Text
Value: NY

Key: pincode
Type: Text
Value: 10001

Key: website
Type: Text
Value: https://johndoe.com
```

#### With Profile Picture

Add all the above fields, plus:

```
Key: profile_picture
Type: File
Value: [Select an image file from your computer]
```

---

## Testing with cURL

### Without Profile Picture

```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/profile/update \
  -F "user_id=550e8400-e29b-41d4-a716-446655440000" \
  -F "full_name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "address=123 Main Street" \
  -F "bio=Software developer and book author" \
  -F "city=New York" \
  -F "state=NY" \
  -F "pincode=10001" \
  -F "website=https://johndoe.com"
```

**Note:** Replace `550e8400-e29b-41d4-a716-446655440000` with an actual UUID from your users table.

### With Profile Picture

```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/profile/update \
  -F "user_id=550e8400-e29b-41d4-a716-446655440000" \
  -F "full_name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "address=123 Main Street" \
  -F "bio=Software developer and book author" \
  -F "city=New York" \
  -F "state=NY" \
  -F "pincode=10001" \
  -F "website=https://johndoe.com" \
  -F "profile_picture=@/path/to/your/image.jpg"
```

**Note:** Replace `550e8400-e29b-41d4-a716-446655440000` with an actual UUID from your users table.

**Note:** Replace `/path/to/your/image.jpg` with the actual path to your image file.

---

## Expected Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "1231",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "+1234567890",
    "address": "123 Main Street",
    "bio": "Software developer and book author",
    "city": "New York",
    "state": "NY",
    "pincode": "10001",
    "website": "https://johndoe.com",
    "avatar_url": "https://your-supabase-url.com/storage/v1/object/public/avatars/1231/1768202283260-profile.jpg",
    "profile_picture": "https://your-supabase-url.com/storage/v1/object/public/avatars/1231/1768202283260-profile.jpg",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T12:30:00.000Z"
  }
}
```

### Error Responses

#### Missing User ID (400 Bad Request)

```json
{
  "error": "Missing user_id or author_id"
}
```

#### Invalid UUID Format (400 Bad Request)

```json
{
  "success": false,
  "error": "Invalid user_id or author_id format",
  "details": "Expected UUID format (e.g., \"550e8400-e29b-41d4-a716-446655440000\"), but received: \"1222\". The user_id must be a valid UUID."
}
```

#### User Not Found (404 Not Found)

```json
{
  "success": false,
  "error": "User not found"
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Error message here"
}
```

---

## Testing Scenarios

### 1. Update Profile Without Picture

**Request:**
```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/profile/update \
  -F "user_id=1231" \
  -F "full_name=Jane Smith" \
  -F "email=jane@example.com"
```

**Expected:** Profile updated successfully, `avatar_url` remains unchanged.

### 2. Update Profile With New Picture

**Request:**
```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/profile/update \
  -F "user_id=1231" \
  -F "full_name=Jane Smith" \
  -F "profile_picture=@profile.jpg"
```

**Expected:** Profile updated, new `avatar_url` returned pointing to uploaded image in Supabase Storage.

### 3. Update Only Specific Fields

**Request:**
```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/profile/update \
  -F "user_id=1231" \
  -F "bio=Updated biography text"
```

**Expected:** Only `bio` field updated, other fields remain unchanged.

### 4. Using author_id Instead of user_id

**Request:**
```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/profile/update \
  -F "author_id=1231" \
  -F "full_name=Author Name"
```

**Expected:** Profile updated using `author_id` as identifier.

---

## File Upload Details

### Profile Picture Upload

- **Bucket:** `avatars`
- **Path Structure:** `{user_id}/{timestamp}-{filename}`
- **Example Path:** `1231/1768202283260-profile.jpg`
- **Supported Formats:** JPEG, PNG, GIF, WebP
- **Max Size:** Depends on Vercel function timeout (60 seconds)

### File Location in Supabase

After successful upload, the file will be stored at:
```
avatars/
  └── {user_id}/
      └── {timestamp}-{filename}
```

Example:
```
avatars/
  └── 1231/
      └── 1768202283260-profile.jpg
```

---

## CORS Headers

The API includes CORS headers for cross-origin requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept, Authorization
```

---

## Notes

1. **Empty Fields:** Empty strings are converted to `null` in the database
2. **File Upload:** If file upload fails, the profile update continues without the picture
3. **Validation:** Email format is validated on the client side (mobile app)
4. **Authentication:** Currently uses `user_id` or `author_id` for identification (no JWT required for testing)
5. **Timeout:** Function timeout is set to 60 seconds for file uploads

---

## Quick Test Commands

### Minimal Test (Name Only)

```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/profile/update \
  -F "user_id=550e8400-e29b-41d4-a716-446655440000" \
  -F "full_name=Test User"
```

**Note:** Replace the UUID with an actual user ID from your database.

### Full Profile Update

```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/profile/update \
  -F "user_id=550e8400-e29b-41d4-a716-446655440000" \
  -F "full_name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "address=123 Main St" \
  -F "bio=Developer" \
  -F "city=NYC" \
  -F "state=NY" \
  -F "pincode=10001" \
  -F "website=https://johndoe.com"
```

### With Image Upload

```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/profile/update \
  -F "user_id=550e8400-e29b-41d4-a716-446655440000" \
  -F "full_name=John Doe" \
  -F "profile_picture=@/Users/yourname/Desktop/profile.jpg"
```

## How to Get a Valid User ID

Since `user_id` must be a UUID, you need to get it from your database:

### Option 1: Query Supabase Database

```sql
SELECT id, name, email FROM users LIMIT 5;
```

### Option 2: Use the Users API

```bash
curl https://admin-orcin-omega.vercel.app/api/users
```

This will return a list of users with their UUIDs.

---

**Last Updated:** Profile Update API with FormData support
