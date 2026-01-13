-- Author Wallet System with Commission and GST
-- Run this in Supabase SQL Editor

-- Add commission and GST fields to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS author_earnings DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Author Wallet table (tracks author's wallet balance)
CREATE TABLE IF NOT EXISTS author_wallet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0 NOT NULL, -- Available balance
  total_earnings DECIMAL(10,2) DEFAULT 0 NOT NULL, -- Total earnings ever
  total_withdrawn DECIMAL(10,2) DEFAULT 0 NOT NULL, -- Total withdrawn
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Withdrawal Requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, completed
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(20),
  bank_name VARCHAR(255),
  upi_id VARCHAR(255), -- Alternative payment method
  payment_method VARCHAR(50) DEFAULT 'bank', -- bank, upi
  admin_notes TEXT,
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who processed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment History table (tracks all author earnings from book sales)
CREATE TABLE IF NOT EXISTS author_payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  audio_book_id UUID REFERENCES audio_books(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Buyer
  gross_amount DECIMAL(10,2) NOT NULL, -- Original payment amount
  gst_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL, -- After GST
  platform_commission DECIMAL(10,2) DEFAULT 0,
  author_earnings DECIMAL(10,2) NOT NULL, -- Final amount to author
  status VARCHAR(20) DEFAULT 'completed', -- completed, refunded
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_author ON payments(author_id);
CREATE INDEX IF NOT EXISTS idx_payments_gst ON payments(gst_amount);
CREATE INDEX IF NOT EXISTS idx_payments_commission ON payments(platform_commission);
CREATE INDEX IF NOT EXISTS idx_author_wallet_author ON author_wallet(author_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_author ON withdrawal_requests(author_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_author_payment_history_author ON author_payment_history(author_id);
CREATE INDEX IF NOT EXISTS idx_author_payment_history_payment ON author_payment_history(payment_id);
CREATE INDEX IF NOT EXISTS idx_author_payment_history_book ON author_payment_history(book_id);

-- Trigger for author_wallet updated_at
CREATE TRIGGER update_author_wallet_updated_at 
  BEFORE UPDATE ON author_wallet
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for withdrawal_requests updated_at
CREATE TRIGGER update_withdrawal_requests_updated_at 
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update author wallet when payment is made
CREATE OR REPLACE FUNCTION update_author_wallet_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if payment is completed and has author_id
  IF NEW.status = 'completed' AND NEW.author_id IS NOT NULL AND NEW.author_earnings > 0 THEN
    -- Insert or update author wallet
    INSERT INTO author_wallet (author_id, balance, total_earnings)
    VALUES (NEW.author_id, NEW.author_earnings, NEW.author_earnings)
    ON CONFLICT (author_id) 
    DO UPDATE SET
      balance = author_wallet.balance + NEW.author_earnings,
      total_earnings = author_wallet.total_earnings + NEW.author_earnings,
      updated_at = NOW();
    
    -- Insert payment history
    INSERT INTO author_payment_history (
      author_id, payment_id, book_id, audio_book_id, user_id,
      gross_amount, gst_amount, net_amount, platform_commission, author_earnings
    )
    VALUES (
      NEW.author_id, NEW.id, NEW.book_id, NEW.audio_book_id, NEW.user_id,
      NEW.amount, NEW.gst_amount, NEW.net_amount, NEW.platform_commission, NEW.author_earnings
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wallet when payment is completed
DROP TRIGGER IF EXISTS trigger_update_author_wallet ON payments;
CREATE TRIGGER trigger_update_author_wallet
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND NEW.author_id IS NOT NULL)
  EXECUTE FUNCTION update_author_wallet_on_payment();

-- Function to update wallet balance on withdrawal
CREATE OR REPLACE FUNCTION update_wallet_on_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Deduct from wallet balance and add to total_withdrawn
    UPDATE author_wallet
    SET 
      balance = balance - NEW.amount,
      total_withdrawn = total_withdrawn + NEW.amount,
      updated_at = NOW()
    WHERE author_id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wallet when withdrawal is completed
DROP TRIGGER IF EXISTS trigger_update_wallet_on_withdrawal ON withdrawal_requests;
CREATE TRIGGER trigger_update_wallet_on_withdrawal
  AFTER UPDATE ON withdrawal_requests
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_wallet_on_withdrawal();
