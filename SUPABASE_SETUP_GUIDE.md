# Next.js API + Supabase - 5000 PDF Books Setup Guide

## Architecture Overview

```
┌─────────────┐
│   Client    │ (Mobile/Admin)
└──────┬──────┘
       │
       ├── API Calls → Next.js API Routes
       │                    │
       │                    ├── Supabase Database (PostgreSQL)
       │                    │   - Books metadata
       │                    │   - Users, Authors
       │                    │   - Indexed for fast queries
       │                    │
       │                    └── Supabase Storage
       │                        - PDF files (5-50MB each)
       │                        - Audio files
       │                        - Cover images
       │                        - CDN delivery
```

## Performance for 5000 Books

### Database Performance
- **With Indexes**: 10-50ms per query
- **With Caching**: 1-5ms per query
- **Pagination**: 20-50 books per page = fast

### File Storage Performance
- **Upload Speed**: 5-10 MB/s (direct to Supabase)
- **Download Speed**: 10-50 MB/s (via CDN)
- **Storage**: ~125-250GB for 5000 PDFs (25-50MB avg)

### API Response Time
- **Simple Query**: 20-50ms
- **With Cache**: 5-15ms
- **File URL Generation**: 10-30ms

## Cost Estimate (5000 Books)

### Supabase Pricing
- **Database**: Free tier (500MB), Pro ($25/month for 8GB)
- **Storage**: Free tier (1GB), then $0.021/GB
- **Bandwidth**: Free tier (5GB), then $0.09/GB

### For 5000 Books (~125GB):
- **Storage**: 125GB × $0.021 = $2.63/month
- **Bandwidth**: ~500GB/month × $0.09 = $45/month
- **Database**: Pro plan $25/month
- **Total**: ~$73/month

## Database Schema

```sql
-- Books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author_id UUID REFERENCES authors(id),
  summary TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  pages INTEGER,
  language VARCHAR(50),
  category_id UUID REFERENCES categories(id),
  isbn VARCHAR(50),
  is_free BOOLEAN DEFAULT false,
  pdf_url TEXT, -- Supabase Storage URL
  cover_image_url TEXT,
  cover_images TEXT[], -- Array of image URLs
  published_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries (CRITICAL for 5000 books)
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_published ON books(published_date DESC);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_language ON books(language);
CREATE FULLTEXT INDEX idx_books_search ON books USING GIN(to_tsvector('english', title || ' ' || summary));

-- Authors table
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  mobile VARCHAR(20),
  bio TEXT,
  avatar_url TEXT,
  books_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  mobile VARCHAR(20),
  role VARCHAR(20) DEFAULT 'reader',
  avatar_url TEXT,
  books_purchased INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Supabase Storage Buckets

```
storage/
├── books/              # PDF files
│   ├── {book_id}.pdf
│   └── ...
├── audio-books/        # Audio files
│   ├── {audio_id}.mp3
│   └── ...
├── covers/             # Book cover images
│   ├── {book_id}/
│   │   ├── cover-1.jpg
│   │   ├── cover-2.jpg
│   │   └── ...
│   └── ...
└── curriculum/         # Government PDFs
    └── {state}/
        └── {curriculum_id}.pdf
```

## Upload Flow

### 1. Generate Upload URL (Presigned URL)
```typescript
// admin/app/api/upload/route.ts
POST /api/upload
- Generate presigned URL for direct upload
- Client uploads directly to Supabase Storage
- Bypasses API server (faster)
```

### 2. Direct Upload to Supabase
```typescript
// Client side
const { data, error } = await supabase.storage
  .from('books')
  .upload(`${bookId}.pdf`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

## Download Flow

### 1. Get File URL
```typescript
// Generate signed URL (expires in 1 hour)
const { data } = await supabase.storage
  .from('books')
  .createSignedUrl(`${bookId}.pdf`, 3600);
```

### 2. Stream PDF
```typescript
// API route for streaming
GET /api/books/[id]/download
- Get signed URL from Supabase
- Return redirect or stream
- CDN handles delivery
```

## API Routes Structure

```
admin/app/api/
├── books/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts          # GET, PUT, DELETE
│       └── download/
│           └── route.ts      # PDF download
├── authors/
│   ├── route.ts
│   └── [id]/route.ts
├── users/
│   ├── route.ts
│   └── [id]/route.ts
├── audio-books/
│   ├── route.ts
│   └── [id]/route.ts
├── upload/
│   └── route.ts              # Generate upload URLs
└── search/
    └── route.ts              # Full-text search
```

## Performance Optimization

### 1. Database Indexing (CRITICAL)
- Index all frequently queried columns
- Full-text search index for title/summary
- Composite indexes for common queries

### 2. Caching Strategy
- **Redis**: Cache popular books (top 100)
- **CDN**: Supabase Storage CDN for files
- **API Cache**: Cache search results (5 minutes)

### 3. Pagination
- Always paginate (20-50 books per page)
- Use cursor-based pagination for large datasets
- Limit results to prevent slow queries

### 4. Lazy Loading
- Load book metadata first
- Load PDF on demand
- Progressive image loading for covers

## Scalability for 5000 Books

### Database
- ✅ PostgreSQL handles millions of rows
- ✅ Indexes keep queries fast
- ✅ Connection pooling for concurrent requests

### Storage
- ✅ Supabase Storage scales automatically
- ✅ CDN handles global delivery
- ✅ No storage limits (pay per GB)

### API
- ✅ Next.js API Routes scale with Vercel
- ✅ Serverless functions handle traffic spikes
- ✅ Edge functions for faster responses

## Security

### Row Level Security (RLS)
```sql
-- Only authors can update their books
CREATE POLICY "Authors can update own books"
ON books FOR UPDATE
USING (auth.uid() = author_id);

-- Public can read published books
CREATE POLICY "Public can read published books"
ON books FOR SELECT
USING (status = 'published');
```

### File Access Control
- Signed URLs expire after 1 hour
- RLS policies on storage buckets
- Authentication required for uploads


