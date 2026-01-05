# 📚 Upload Book API - Complete Check

## API Endpoints Overview

### 1. File Upload API: `POST /api/upload`

**Purpose**: Upload files (PDF, images, audio) to Supabase Storage

**Endpoint**: `https://admin-orcin-omega.vercel.app/api/upload`

**Request Types**:
- **File Upload** (multipart/form-data): Uploads actual file
- **URL Generation** (application/json): Generates presigned URL

**Parameters** (FormData):
- `file`: The file to upload
- `bucket`: Storage bucket name (e.g., "books", "covers")
- `folder`: Optional folder path (e.g., "pdfs", "covers")
- `fileName`: Original file name
- `fileType`: MIME type (e.g., "application/pdf", "image/jpeg")

**Response** (Success):
```json
{
  "success": true,
  "path": "pdfs/1234567890-book.pdf",
  "url": "https://...supabase.co/storage/v1/object/public/books/pdfs/1234567890-book.pdf"
}
```

**Response** (Error):
```json
{
  "error": "Error message"
}
```

---

### 2. Book Creation API: `POST /api/books`

**Purpose**: Create a new book record in the database

**Endpoint**: `https://admin-orcin-omega.vercel.app/api/books`

**Request Body** (JSON):
```json
{
  "title": "Book Title",
  "author_id": "uuid",
  "summary": "Book description",
  "price": 99.99,
  "pages": 250,
  "language": "English",
  "category_id": "uuid",
  "isbn": "978-1234567890",
  "is_free": false,
  "pdf_url": "https://...supabase.co/.../book.pdf",
  "cover_image_url": "https://...supabase.co/.../cover.jpg",
  "cover_images": ["https://.../cover1.jpg", "https://.../cover2.jpg"]
}
```

**Required Fields**:
- `title`
- `author_id`
- `category_id`

**Response** (Success):
```json
{
  "book": {
    "id": "uuid",
    "title": "Book Title",
    ...
  }
}
```

**Features**:
- ✅ Auto-creates author if doesn't exist
- ✅ Validates category exists
- ✅ Handles cover_images array
- ✅ Updates author's book count

---

## Upload Flow (Mobile App → Server)

### Step-by-Step Process:

1. **User selects PDF file**
   - Mobile app: `BookUploadScreen.js`
   - Uses: `react-native-document-picker`

2. **User selects cover images**
   - Mobile app: `BookUploadScreen.js`
   - Uses: `react-native-image-picker`

3. **Upload PDF file**
   - API: `POST /api/upload`
   - Method: `apiClient.uploadFile(fileToUpload, 'books', 'pdfs')`
   - Returns: `pdfUrl`

4. **Upload cover images** (parallel)
   - API: `POST /api/upload` (multiple calls)
   - Method: `apiClient.uploadFile(imageFile, 'books', 'covers')`
   - Returns: Array of `coverImageUrls`

5. **Create book record**
   - API: `POST /api/books`
   - Method: `apiClient.createBook(bookData)`
   - Includes: `pdf_url`, `cover_image_url`, `cover_images[]`

---

## Current Status

### ✅ Working:
- Books API endpoint: **Working** (returns empty array - no books yet)
- API routing: **Correct**
- Code structure: **Well organized**
- Error handling: **Implemented**
- Auto-create author: **Implemented**
- Category validation: **Implemented**

### ⚠️ Issues:
- Upload API: **Returns "Internal server error"**
  - Likely cause: Supabase storage bucket doesn't exist or permissions issue
  - Need to verify: Supabase storage buckets are created

---

## Testing the APIs

### Test 1: Upload API (URL Generation)
```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.pdf",
    "fileType": "application/pdf",
    "bucket": "books",
    "folder": "test"
  }'
```

**Expected**: Presigned URL or error if bucket doesn't exist

### Test 2: Books API
```bash
curl -X GET 'https://admin-orcin-omega.vercel.app/api/books?limit=1'
```

**Expected**: List of books (currently empty)

### Test 3: Create Book (requires valid data)
```bash
curl -X POST https://admin-orcin-omega.vercel.app/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "author_id": "uuid-here",
    "category_id": "uuid-here",
    "summary": "Test description",
    "price": 99.99
  }'
```

---

## Code Files

### Server-Side:
- `admin/app/api/upload/route.ts` - File upload handler
- `admin/app/api/books/route.ts` - Book CRUD operations

### Client-Side:
- `mobile/src/services/api.js` - API client
- `mobile/src/screens/main/BookUploadScreen.js` - Upload UI

---

## Required Supabase Setup

### Storage Buckets Needed:
1. **`books`** - For PDF files and cover images
   - Subfolders: `pdfs/`, `covers/`
2. **`audio`** - For audio book files (if needed)

### Bucket Configuration:
- **Public**: Yes (for public access to books)
- **File size limit**: Configure as needed
- **Allowed MIME types**: 
  - PDF: `application/pdf`
  - Images: `image/jpeg`, `image/png`, `image/webp`
  - Audio: `audio/mpeg`, `audio/mp3`

---

## Troubleshooting

### Issue: "Internal server error" on upload
**Possible causes**:
1. Supabase storage bucket doesn't exist
2. Service role key doesn't have permissions
3. File reading error (React Native format issue)

**Solutions**:
1. Create storage buckets in Supabase Dashboard
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
3. Check Vercel function logs for detailed errors

### Issue: "Network request failed" in mobile app
**Possible causes**:
1. API URL incorrect
2. CORS issue
3. Network connectivity

**Solutions**:
1. Verify `API_BASE_URL` in `mobile/src/services/api.js`
2. Check Vercel deployment is live
3. Test API endpoint directly with curl

---

## Next Steps

1. ✅ **Verify Supabase Storage Buckets**
   - Go to Supabase Dashboard → Storage
   - Create `books` bucket if doesn't exist
   - Set bucket to public

2. ✅ **Test File Upload**
   - Use a small test file
   - Verify file appears in Supabase Storage

3. ✅ **Test Book Creation**
   - Create a test book with valid data
   - Verify it appears in database

4. ✅ **Test Full Flow from Mobile App**
   - Upload PDF
   - Upload cover images
   - Create book record
   - Verify all steps complete successfully

---

## API Improvements Made

1. ✅ Enhanced file type detection (File, Blob, ReadableStream)
2. ✅ Auto-create author from user data
3. ✅ Validate category before creating book
4. ✅ Better error messages
5. ✅ Support for multiple cover images
6. ✅ React Native FormData compatibility

---

**Last Updated**: After deployment fix for React Native FormData handling

