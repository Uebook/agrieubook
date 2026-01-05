# Book Upload Example - Complete Implementation

## Quick Summary: How Upload Works

### Upload Flow

```
1. User selects PDF file + fills form
   ↓
2. Upload PDF to Supabase Storage (PUT /api/upload)
   ↓
3. Get PDF URL from response
   ↓
4. Upload cover image (optional)
   ↓
5. Create book record with PDF URL (POST /api/books)
   ↓
6. Done! ✅
```

### For Video/Audio Books

```
1. User selects audio/video file
   ↓
2. Upload to Supabase Storage (audio-books bucket)
   ↓
3. Get file URL
   ↓
4. Create audio book record with file URL
   ↓
5. Done! ✅
```

## Two Methods Available

### Method 1: Using API Client (Recommended)
```typescript
// Simple and easy
const result = await apiClient.uploadFile(file, 'books', 'pdfs');
const pdfUrl = result.url;
```

### Method 2: Direct Supabase Upload
```typescript
// More control, uploads directly
import { supabase } from '@/lib/supabase/client';
const { data } = await supabase.storage
  .from('books')
  .upload(path, file);
```

## File Types Supported

- ✅ **PDFs** → `books` bucket
- ✅ **Audio (MP3, M4A)** → `audio-books` bucket  
- ✅ **Video (MP4, MOV)** → `audio-books` bucket (if needed)
- ✅ **Images (JPG, PNG)** → `covers` bucket

## Storage Buckets

1. **books** (private) - PDF files
2. **audio-books** (private) - Audio/video files
3. **covers** (public) - Cover images
4. **curriculum** (private) - Government PDFs


