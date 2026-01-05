-- Complete Database Schema for Agri eBook Hub
-- Run this in Supabase SQL Editor to set up all tables and columns

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Add interests column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add password_hash column if it doesn't exist (for future password hashing)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  books_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
  summary TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  original_price DECIMAL(10,2),
  pages INTEGER,
  language VARCHAR(50) DEFAULT 'English',
  isbn VARCHAR(50),
  is_free BOOLEAN DEFAULT false,
  pdf_url TEXT,
  cover_image_url TEXT,
  cover_images TEXT[] DEFAULT '{}',
  published_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, published, rejected
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audio Books table
CREATE TABLE IF NOT EXISTS audio_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  duration VARCHAR(20), -- e.g., "45:30"
  language VARCHAR(50) DEFAULT 'English',
  audio_url TEXT,
  cover_url TEXT,
  published_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Curriculum table
CREATE TABLE IF NOT EXISTS curriculum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  grade VARCHAR(50),
  subject VARCHAR(100),
  pdf_url TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_audio_books_author ON audio_books(author_id);
CREATE INDEX IF NOT EXISTS idx_audio_books_category ON audio_books(category_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_book ON payments(book_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_authors_updated_at ON authors;
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audio_books_updated_at ON audio_books;
CREATE TRIGGER update_audio_books_updated_at BEFORE UPDATE ON audio_books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment author books count
CREATE OR REPLACE FUNCTION increment_author_books(author_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE authors 
    SET books_count = books_count + 1 
    WHERE id = author_id_param;
END;
$$ language 'plpgsql';

-- Note: This schema is idempotent - you can run it multiple times safely
-- It will:
-- - Create tables if they don't exist
-- - Add columns if they don't exist
-- - Create indexes if they don't exist
-- - Replace functions and triggers (safe to re-run)

