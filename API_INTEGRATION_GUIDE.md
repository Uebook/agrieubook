# API Integration Guide - Admin Panel & Mobile App

## ✅ What's Been Set Up

### 1. Admin Panel API Client
- **Location**: `admin/lib/api/client.ts`
- **Purpose**: Handles all API requests from admin panel
- **Features**: 
  - Books CRUD operations
  - Authors CRUD operations
  - Users CRUD operations
  - Audio Books CRUD operations
  - File upload/download
  - Dashboard stats

### 2. Mobile App API Client
- **Location**: `mobile/src/services/api.js`
- **Purpose**: Handles all API requests from mobile app
- **Features**:
  - Books API
  - Authors API
  - Audio Books API
  - File upload
  - Search functionality

### 3. API Endpoints Created
All endpoints are in `admin/app/api/`:
- ✅ `/api/books` - List, Create books
- ✅ `/api/books/[id]` - Get, Update, Delete book
- ✅ `/api/books/[id]/download` - Get PDF download URL
- ✅ `/api/authors` - List, Create authors
- ✅ `/api/authors/[id]` - Get, Update, Delete author
- ✅ `/api/users` - List users
- ✅ `/api/users/[id]` - Get, Update user
- ✅ `/api/audio-books` - List, Create audio books
- ✅ `/api/audio-books/[id]` - Get, Update, Delete audio book
- ✅ `/api/upload` - File upload
- ✅ `/api/dashboard` - Dashboard statistics

### 4. Updated Pages
- ✅ Dashboard page now uses API (`admin/app/dashboard/page.tsx`)

---

## 🔧 Configuration

### Admin Panel Configuration

The API client automatically uses:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
```

Make sure `.env.local` has:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Mobile App Configuration

**Important**: Update `mobile/src/services/api.js`:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:3000'  // For physical device testing
  : 'https://your-production-url.com';  // For production
```

**For physical device testing:**
1. Find your local IP:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
2. Update API_BASE_URL to: `http://192.168.x.x:3000` (your IP)
3. Make sure your computer and device are on same network

---

## 📝 How to Use

### Admin Panel

#### Example: Fetch Books
```typescript
import apiClient from '@/lib/api/client';

// Get all books
const { books, pagination } = await apiClient.getBooks({
  page: 1,
  limit: 20,
  status: 'published'
});

// Get single book
const { book } = await apiClient.getBook('book-id');

// Create book
const { book: newBook } = await apiClient.createBook({
  title: 'Book Title',
  author_id: 'author-id',
  category_id: 'category-id',
  // ... other fields
});
```

#### Example: Update Dashboard
See `admin/app/dashboard/page.tsx` for example using `useEffect` and `apiClient.getDashboardStats()`

### Mobile App

#### Example: Fetch Books
```javascript
import apiClient from '../services/api';

// Get all books
const { books, pagination } = await apiClient.getBooks({
  page: 1,
  limit: 20,
  category: 'category-id'
});

// Get single book
const { book } = await apiClient.getBook('book-id');

// Get download URL
const { downloadUrl } = await apiClient.getBookDownloadUrl('book-id');
```

#### Example: Use in React Native Component
```javascript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import apiClient from '../services/api';

export default function BooksScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getBooks({ page: 1, limit: 20 });
      setBooks(data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        books.map(book => (
          <Text key={book.id}>{book.title}</Text>
        ))
      )}
    </View>
  );
}
```

---

## 🚀 Next Steps to Complete Integration

### Admin Panel Pages to Update

1. **Books Page** (`admin/app/books/page.tsx`)
   - Replace `dummyBooks` with `apiClient.getBooks()`
   - Add loading/error states
   - Implement pagination

2. **Authors Page** (`admin/app/authors/page.tsx`)
   - Replace dummy data with `apiClient.getAuthors()`

3. **Users Page** (`admin/app/users/page.tsx`)
   - Replace dummy data with `apiClient.getUsers()`

4. **Audio Books Page** (`admin/app/audio-books/page.tsx`)
   - Replace dummy data with `apiClient.getAudioBooks()`

### Mobile App Screens to Update

1. **Home Screen** (`mobile/src/screens/main/HomeScreen.js`)
   - Fetch trending books using `apiClient.getBooks()`

2. **Book Store Screen** (`mobile/src/screens/main/BookStoreScreen.js`)
   - Fetch all books with filters

3. **Book Detail Screen** (`mobile/src/screens/main/BookDetailScreen.js`)
   - Fetch book details using `apiClient.getBook()`

4. **Author Screen** (`mobile/src/screens/main/`)
   - Fetch author details and books

---

## 🧪 Testing

### Test Admin Panel API

1. Start admin panel:
   ```bash
   cd admin
   npm run dev
   ```

2. Test API endpoint:
   ```bash
   curl http://localhost:3000/api/books
   ```

   Should return:
   ```json
   {
     "books": [],
     "pagination": {
       "page": 1,
       "limit": 20,
       "total": 0,
       "totalPages": 0
     }
   }
   ```

### Test Mobile App API

1. Update API_BASE_URL in `mobile/src/services/api.js`
2. Make sure admin panel is running
3. Test in mobile app

---

## 📦 API Endpoints Summary

### Books
- `GET /api/books` - List books (with pagination, filters)
- `GET /api/books/[id]` - Get single book
- `POST /api/books` - Create book
- `PUT /api/books/[id]` - Update book
- `DELETE /api/books/[id]` - Delete book
- `GET /api/books/[id]/download` - Get PDF download URL

### Authors
- `GET /api/authors` - List authors
- `GET /api/authors/[id]` - Get single author
- `POST /api/authors` - Create author
- `PUT /api/authors/[id]` - Update author
- `DELETE /api/authors/[id]` - Delete author

### Users
- `GET /api/users` - List users
- `GET /api/users/[id]` - Get single user
- `PUT /api/users/[id]` - Update user

### Audio Books
- `GET /api/audio-books` - List audio books
- `GET /api/audio-books/[id]` - Get single audio book
- `POST /api/audio-books` - Create audio book
- `PUT /api/audio-books/[id]` - Update audio book
- `DELETE /api/audio-books/[id]` - Delete audio book

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Upload
- `POST /api/upload` - Get upload URL
- `PUT /api/upload` - Upload file directly

---

## ⚠️ Important Notes

1. **Supabase Setup Required**: Make sure Supabase is set up (see `SETUP_INSTRUCTIONS.md`)

2. **Environment Variables**: `.env.local` must have Supabase credentials

3. **Database Schema**: Run `database/schema.sql` in Supabase SQL Editor

4. **Storage Buckets**: Create storage buckets in Supabase Dashboard

5. **CORS**: For mobile app, if needed, add CORS headers to API routes

6. **Error Handling**: Always wrap API calls in try-catch blocks

---

## 🎉 You're All Set!

The API infrastructure is ready. Now you can:
- ✅ Update admin panel pages to use API
- ✅ Update mobile app screens to use API
- ✅ Test API endpoints
- ✅ Start building features!

For questions or issues, check the API client files or test endpoints directly.


