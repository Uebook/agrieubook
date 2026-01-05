-- Additional Tables for Order History, Wishlist, Notifications, YouTube Channels
-- Run this in Supabase SQL Editor after COMPLETE_SCHEMA.sql

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id) -- Prevent duplicate wishlist items
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(10) DEFAULT '🔔',
  type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
  is_read BOOLEAN DEFAULT false,
  action_type VARCHAR(50), -- navigate, url, etc.
  action_screen VARCHAR(100), -- screen name if action_type is 'navigate'
  action_params JSONB, -- additional params for action
  created_at TIMESTAMP DEFAULT NOW()
);

-- YouTube Channels table (for admin to manage)
CREATE TABLE IF NOT EXISTS youtube_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel_url TEXT NOT NULL,
  thumbnail_url TEXT,
  subscriber_count VARCHAR(50),
  video_count VARCHAR(50),
  verified BOOLEAN DEFAULT false,
  category_ids TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Purchases table (to track purchased books)
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id) -- Prevent duplicate purchases
);

-- Update payments table to include audio_book_id
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS audio_book_id UUID REFERENCES audio_books(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_book ON wishlist(book_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_book ON user_purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_youtube_channels_active ON youtube_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- Trigger for youtube_channels updated_at
DROP TRIGGER IF EXISTS update_youtube_channels_updated_at ON youtube_channels;
CREATE TRIGGER update_youtube_channels_updated_at BEFORE UPDATE ON youtube_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment user purchases count and total spent
CREATE OR REPLACE FUNCTION increment_user_purchases(user_id_param UUID, amount_param DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
      books_purchased = books_purchased + 1,
      total_spent = total_spent + amount_param
    WHERE id = user_id_param;
END;
$$ language 'plpgsql';

