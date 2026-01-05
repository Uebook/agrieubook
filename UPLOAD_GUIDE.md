# Upload Guide: Videos, Books (PDFs), and Book Data

## 📤 How File Upload Works

### Architecture
```
Client (Admin/Mobile)
    ↓
1. Get Upload URL from API
    ↓
2. Upload File Directly to Supabase Storage (bypasses server)
    ↓
3. Get File URL
    ↓
4. Save Book Data with File URL to Database
```

---

## 📚 Upload Book (PDF + Metadata)

### Step 1: Upload PDF File to Supabase Storage

#### Admin Panel Example

```typescript
import apiClient from '@/lib/api/client';

async function uploadBook(pdfFile: File, bookData: any) {
  try {
    // Step 1: Upload PDF file
    const uploadResult = await apiClient.uploadFile(
      pdfFile,
      'books', // bucket name
      'pdfs' // optional folder
    );
    
    // Step 2: Get file URL
    const pdfUrl = uploadResult.url;
    
    // Step 3: Upload cover image (optional)
    let coverImageUrl = '';
    if (bookData.coverImage) {
      const coverResult = await apiClient.uploadFile(
        bookData.coverImage,
        'covers',
        bookData.id // use book ID as folder
      );
      coverImageUrl = coverResult.url;
    }
    
    // Step 4: Create book with file URLs
    const { book } = await apiClient.createBook({
      title: bookData.title,
      author_id: bookData.authorId,
      category_id: bookData.categoryId,
      summary: bookData.summary,
      price: bookData.price,
      pages: bookData.pages,
      language: bookData.language,
      pdf_url: pdfUrl, // PDF file URL
      cover_image_url: coverImageUrl, // Cover image URL
      // ... other fields
    });
    
    return book;
  } catch (error) {
    console.error('Error uploading book:', error);
    throw error;
  }
}
```

#### Complete Example with Form

```typescript
'use client';

import { useState } from 'react';
import apiClient from '@/lib/api/client';

export default function BookUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    authorId: '',
    categoryId: '',
    price: 0,
    pdfFile: null as File | null,
    coverImage: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pdfFile) {
      alert('Please select a PDF file');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Step 1: Upload PDF
      setProgress(10);
      const pdfResult = await apiClient.uploadFile(
        formData.pdfFile,
        'books',
        'pdfs'
      );
      setProgress(50);

      // Step 2: Upload cover image (if provided)
      let coverUrl = '';
      if (formData.coverImage) {
        const coverResult = await apiClient.uploadFile(
          formData.coverImage,
          'covers',
          'books'
        );
        coverUrl = coverResult.url;
        setProgress(70);
      }

      // Step 3: Create book record
      const { book } = await apiClient.createBook({
        title: formData.title,
        author_id: formData.authorId,
        category_id: formData.categoryId,
        price: formData.price,
        pdf_url: pdfResult.url,
        cover_image_url: coverUrl,
        status: 'pending',
      });
      setProgress(100);

      alert('Book uploaded successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload book');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Book Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFormData({ 
          ...formData, 
          pdfFile: e.target.files?.[0] || null 
        })}
        required
      />
      
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFormData({ 
          ...formData, 
          coverImage: e.target.files?.[0] || null 
        })}
      />
      
      {uploading && (
        <div>
          <div>Uploading... {progress}%</div>
          <progress value={progress} max={100} />
        </div>
      )}
      
      <button type="submit" disabled={uploading}>
        Upload Book
      </button>
    </form>
  );
}
```

---

## 🎥 Upload Video/Audio Book

### Step-by-Step Process

```typescript
async function uploadAudioBook(audioFile: File, audioBookData: any) {
  try {
    // Step 1: Upload audio file to Supabase Storage
    const uploadResult = await apiClient.uploadFile(
      audioFile,
      'audio-books', // bucket name
      'audio' // optional folder
    );
    
    // Step 2: Get file URL
    const audioUrl = uploadResult.url;
    
    // Step 3: Upload cover image (optional)
    let coverUrl = '';
    if (audioBookData.coverImage) {
      const coverResult = await apiClient.uploadFile(
        audioBookData.coverImage,
        'covers',
        'audio-books'
      );
      coverUrl = coverResult.url;
    }
    
    // Step 4: Create audio book record
    const { audioBook } = await apiClient.createAudioBook({
      title: audioBookData.title,
      author_id: audioBookData.authorId,
      description: audioBookData.description,
      audio_url: audioUrl, // Audio file URL
      cover_url: coverUrl, // Cover image URL
      duration: audioBookData.duration,
      language: audioBookData.language,
      is_free: true, // Audio books are free
      status: 'pending',
    });
    
    return audioBook;
  } catch (error) {
    console.error('Error uploading audio book:', error);
    throw error;
  }
}
```

---

## 📱 Mobile App Upload Example

### React Native Upload

```javascript
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker'; // Install: npm install react-native-document-picker
import ImagePicker from 'react-native-image-picker'; // Install: npm install react-native-image-picker
import apiClient from '../services/api';

export default function BookUploadScreen() {
  const [uploading, setUploading] = useState(false);

  const uploadBook = async () => {
    try {
      setUploading(true);

      // Step 1: Pick PDF file
      const pdfResult = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      // Step 2: Pick cover image (optional)
      const imageResult = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      // Step 3: Upload PDF file
      const pdfFile = {
        uri: pdfResult[0].uri,
        type: 'application/pdf',
        name: pdfResult[0].name,
      };
      
      const pdfUploadResult = await apiClient.uploadFile(
        pdfFile,
        'books',
        'pdfs'
      );

      // Step 4: Upload cover image (if selected)
      let coverUrl = '';
      if (imageResult.assets && imageResult.assets[0]) {
        const coverFile = {
          uri: imageResult.assets[0].uri,
          type: 'image/jpeg',
          name: 'cover.jpg',
        };
        
        const coverUploadResult = await apiClient.uploadFile(
          coverFile,
          'covers',
          'books'
        );
        coverUrl = coverUploadResult.url;
      }

      // Step 5: Create book record
      const { book } = await apiClient.createBook({
        title: 'Book Title',
        author_id: 'author-id',
        category_id: 'category-id',
        pdf_url: pdfUploadResult.url,
        cover_image_url: coverUrl,
        price: 299,
        // ... other fields
      });

      Alert.alert('Success', 'Book uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload book');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <Button 
        title={uploading ? 'Uploading...' : 'Upload Book'} 
        onPress={uploadBook}
        disabled={uploading}
      />
    </View>
  );
}
```

---

## 🔄 Direct Upload to Supabase (Alternative Method)

### Using Supabase Client Directly

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Upload PDF directly
async function uploadPDFDirect(file: File, bookId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${bookId}.${fileExt}`;
  const filePath = `pdfs/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from('books')
    .upload(filePath, file, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Get public URL (or signed URL for private)
  const { data: urlData } = supabase.storage
    .from('books')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
```

---

## 📋 Upload Flow Summary

### For Books (PDFs):

1. **User selects PDF file** → Form input
2. **Upload PDF to Supabase Storage** → `apiClient.uploadFile()` or direct Supabase
3. **Get PDF URL** → From upload result
4. **Upload cover image** (optional) → Same process
5. **Create book record** → `apiClient.createBook()` with file URLs
6. **File URLs stored in database** → PDF URL, cover URL

### For Audio/Video Books:

1. **User selects audio/video file** → Form input
2. **Upload to Supabase Storage** → `audio-books` bucket
3. **Get file URL** → From upload result
4. **Upload cover image** (optional)
5. **Create audio book record** → `apiClient.createAudioBook()` with file URL
6. **File URL stored in database** → Audio URL, cover URL

---

## 🗂️ File Organization in Storage

### Supabase Storage Structure

```
storage/
├── books/
│   ├── pdfs/
│   │   ├── book-id-1.pdf
│   │   ├── book-id-2.pdf
│   │   └── ...
│
├── audio-books/
│   ├── audio/
│   │   ├── audio-id-1.mp3
│   │   ├── audio-id-2.mp3
│   │   └── ...
│
├── covers/
│   ├── books/
│   │   ├── book-id-1.jpg
│   │   └── ...
│   ├── audio-books/
│   │   ├── audio-id-1.jpg
│   │   └── ...
│
└── curriculum/
    └── state-name/
        └── curriculum-id.pdf
```

---

## ⚙️ Upload API Endpoints

### Current Implementation

**POST /api/upload** - Get upload URL (for presigned URLs - if implemented)
**PUT /api/upload** - Upload file directly

The current implementation in `admin/app/api/upload/route.ts`:
- Uses Supabase Storage
- Supports direct file upload
- Returns file URL after upload

---

## 📝 Database Fields for File URLs

### Books Table
```sql
pdf_url TEXT,              -- PDF file URL from Supabase Storage
cover_image_url TEXT,      -- Cover image URL
cover_images TEXT[],       -- Array of additional cover image URLs
```

### Audio Books Table
```sql
audio_url TEXT,            -- Audio file URL from Supabase Storage
cover_url TEXT,            -- Cover image URL
```

---

## 🎯 Complete Upload Example

### Admin Panel: Upload Book with PDF

```typescript
// admin/app/books/add/page.tsx (example)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

export default function AddBookPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    authorId: '',
    categoryId: '',
    price: '',
    summary: '',
    pdfFile: null as File | null,
    coverImage: null as File | null,
  });

  const handleFileChange = (field: 'pdfFile' | 'coverImage', file: File | null) => {
    setFormData({ ...formData, [field]: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pdfFile) {
      alert('Please select a PDF file');
      return;
    }

    try {
      setUploading(true);

      // 1. Upload PDF
      const pdfResult = await apiClient.uploadFile(
        formData.pdfFile,
        'books',
        'pdfs'
      );

      // 2. Upload cover (if provided)
      let coverUrl = '';
      if (formData.coverImage) {
        const coverResult = await apiClient.uploadFile(
          formData.coverImage,
          'covers',
          'books'
        );
        coverUrl = coverResult.url;
      }

      // 3. Create book
      await apiClient.createBook({
        title: formData.title,
        author_id: formData.authorId,
        category_id: formData.categoryId,
        price: parseFloat(formData.price),
        summary: formData.summary,
        pdf_url: pdfResult.url,
        cover_image_url: coverUrl,
        status: 'pending',
      });

      router.push('/books');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload book');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => handleFileChange('pdfFile', e.target.files?.[0] || null)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange('coverImage', e.target.files?.[0] || null)}
      />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Book'}
      </button>
    </form>
  );
}
```

---

## ✅ Summary

**Upload Process:**
1. Select file (PDF, audio, image)
2. Upload to Supabase Storage using API
3. Get file URL from upload result
4. Save book/audio book data with file URL to database
5. Done!

**Key Points:**
- Files upload directly to Supabase Storage (fast)
- File URLs are stored in database
- Supports PDFs, audio, video, images
- Works in both admin panel and mobile app
- Progress tracking available

Ready to implement uploads! 🚀


