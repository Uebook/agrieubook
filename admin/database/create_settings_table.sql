-- Create settings table for platform configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name VARCHAR(255) DEFAULT 'Agribook',
  support_email VARCHAR(255) DEFAULT 'support@agribook.com',
  auto_approve_books BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a single settings record (singleton pattern)
-- Only one settings record should exist
INSERT INTO settings (id, platform_name, support_email, auto_approve_books, email_notifications)
VALUES (gen_random_uuid(), 'Agribook', 'support@agribook.com', false, true)
ON CONFLICT DO NOTHING;

-- Add RLS policies if needed (adjust based on your auth setup)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust based on your needs)
CREATE POLICY "Allow all for authenticated users" ON settings
  FOR ALL
  USING (true)
  WITH CHECK (true);
