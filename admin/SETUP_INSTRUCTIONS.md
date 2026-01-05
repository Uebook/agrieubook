# Next.js API + Supabase Setup Instructions

## Quick Setup Guide

### 1. Install Dependencies

```bash
cd admin
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Note down:
   - Project URL
   - Anon/Public Key
   - Service Role Key (for admin operations)

### 3. Set Up Environment Variables

Create `.env.local` file in `admin/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Database

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `database/schema.sql`
3. This creates all tables and indexes

### 5. Set Up Storage Buckets

Go to Supabase Dashboard → Storage:

Create these buckets:
- `books` (Public: false, for PDF files)
- `audio-books` (Public: false, for audio files)
- `covers` (Public: true, for cover images)
- `curriculum` (Public: false, for government PDFs)

### 6. Configure Storage Policies

For each bucket, set up Row Level Security (RLS):

**Books Bucket (Private):**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'books');

-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'books');
```

**Covers Bucket (Public):**
```sql
-- Allow public read
CREATE POLICY "Public can read covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');

-- Allow authenticated upload
CREATE POLICY "Authenticated can upload covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'covers');
```

### 7. Test the API

Start the development server:

```bash
npm run dev
```

Test endpoints:
- `GET http://localhost:3000/api/books` - List books
- `POST http://localhost:3000/api/books` - Create book
- `GET http://localhost:3000/api/books/[id]` - Get book
- `GET http://localhost:3000/api/books/[id]/download` - Get download URL

## Upload Flow for PDF Books

### Step 1: Generate Upload URL

```typescript
// Client side
const response = await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: 'book.pdf',
    fileType: 'application/pdf',
    bucket: 'books',
    folder: 'pdfs', // optional
  }),
});

const { uploadUrl, path, token } = await response.json();
```

### Step 2: Upload File Directly to Supabase

```typescript
// Using Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.storage
  .from('books')
  .upload(path, file, {
    contentType: 'application/pdf',
    cacheControl: '3600',
    upsert: false,
  });

if (error) {
  console.error('Upload error:', error);
  return;
}

// Get public URL (or signed URL for private files)
const { data: urlData } = supabase.storage
  .from('books')
  .getPublicUrl(path);
```

### Step 3: Save Book with PDF URL

```typescript
const response = await fetch('/api/books', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Book Title',
    author_id: 'author-uuid',
    category_id: 'category-uuid',
    pdf_url: urlData.publicUrl,
    // ... other fields
  }),
});
```

## Download Flow for PDF Books

### Get Signed Download URL

```typescript
// Client side
const response = await fetch(`/api/books/${bookId}/download`);
const { downloadUrl, expiresAt } = await response.json();

// Use downloadUrl to download or display PDF
window.open(downloadUrl, '_blank');
```

## Performance Optimization for 5000 Books

### 1. Database Indexes (Already in schema.sql)
- All frequently queried columns are indexed
- Full-text search index for title/summary
- Composite indexes for common queries

### 2. Pagination
Always use pagination:
```
GET /api/books?page=1&limit=20
```

### 3. Caching
- Use Redis for caching popular books
- Cache search results for 5 minutes
- Use Supabase CDN for file delivery

### 4. Lazy Loading
- Load book metadata first
- Load PDF on demand
- Progressive image loading

## Cost Estimate (5000 Books)

### Storage
- 5000 PDFs (avg 25MB): ~125GB
- Storage cost: 125GB × $0.021 = $2.63/month

### Bandwidth
- Estimated: 500GB/month
- Bandwidth cost: 500GB × $0.09 = $45/month

### Database
- Pro plan: $25/month (8GB database)

### Total: ~$73/month

## Monitoring

### Supabase Dashboard
- Monitor storage usage
- Check database performance
- View API usage
- Monitor bandwidth

### Performance Metrics
- API response time: 20-50ms
- File upload speed: 5-10 MB/s
- File download speed: 10-50 MB/s (via CDN)
- Database query time: 10-50ms (with indexes)

## Troubleshooting

### Slow Queries
- Check if indexes are created
- Use EXPLAIN ANALYZE in SQL editor
- Check query pagination

### Upload Failures
- Check file size limits (default: 50MB)
- Verify storage bucket policies
- Check authentication

### Download Issues
- Verify signed URL generation
- Check storage bucket access policies
- Verify file exists in storage




