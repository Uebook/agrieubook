-- Agribook Database Schema for Supabase
-- Optimized for 5000+ books

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  mobile VARCHAR(20),
  bio TEXT,
  avatar_url TEXT,
  books_count INTEGER DEFAULT 0,
  audio_books_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  summary TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  original_price DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  pages INTEGER,
  language VARCHAR(50) DEFAULT 'English',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  isbn VARCHAR(50),
  is_free BOOLEAN DEFAULT false,
  pdf_url TEXT, -- Supabase Storage URL
  cover_image_url TEXT,
  cover_images TEXT[], -- Array of image URLs
  published_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, published, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audio Books table
CREATE TABLE IF NOT EXISTS audio_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  description TEXT,
  audio_url TEXT, -- Supabase Storage URL
  cover_url TEXT,
  duration VARCHAR(20), -- Format: "45:30"
  language VARCHAR(50) DEFAULT 'English',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_free BOOLEAN DEFAULT true,
  published_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  mobile VARCHAR(20),
  role VARCHAR(20) DEFAULT 'reader', -- reader, author, admin
  avatar_url TEXT,
  books_purchased INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Government Curriculum table
CREATE TABLE IF NOT EXISTS curriculum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  state VARCHAR(50) NOT NULL,
  state_name VARCHAR(100),
  pdf_url TEXT, -- Supabase Storage URL
  banner_url TEXT,
  language VARCHAR(50) DEFAULT 'Hindi',
  description TEXT,
  published_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CRITICAL: Indexes for fast queries on 5000+ books
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_created ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_free ON books(is_free);

-- Full-text search index (for title and summary search)
CREATE INDEX IF NOT EXISTS idx_books_search ON books USING GIN(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, ''))
);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_books_category_status ON books(category_id, status);
CREATE INDEX IF NOT EXISTS idx_books_author_status ON books(author_id, status);

-- Indexes for other tables
CREATE INDEX IF NOT EXISTS idx_audio_books_author ON audio_books(author_id);
CREATE INDEX IF NOT EXISTS idx_audio_books_category ON audio_books(category_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_state ON curriculum(state);

-- Function to increment book views
CREATE OR REPLACE FUNCTION increment_book_views(book_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE books
  SET views_count = views_count + 1
  WHERE id = book_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to increment author books count
CREATE OR REPLACE FUNCTION increment_author_books(author_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE authors
  SET books_count = books_count + 1
  WHERE id = author_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, icon) VALUES
  ('Organic Farming', '🌱'),
  ('Crop Management', '🌾'),
  ('Soil Science', '🌍'),
  ('Livestock Management', '🐄'),
  ('Agricultural Technology', '🚜'),
  ('Pest Control', '🐛'),
  ('Irrigation Systems', '💧'),
  ('Agricultural Economics', '💰'),
  ('Sustainable Agriculture', '♻️'),
  ('Horticulture', '🌳')
ON CONFLICT DO NOTHING;




