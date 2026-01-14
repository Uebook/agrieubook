import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// CORS headers helper
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  Object.entries(getCorsHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// POST /api/wallet/withdraw - Create withdrawal request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      author_id,
      amount,
      bank_account_name,
      bank_account_number,
      bank_ifsc,
      bank_name,
      upi_id,
      payment_method = 'bank',
    } = body;

    if (!author_id || !amount) {
      const errorResponse = NextResponse.json(
        { error: 'author_id and amount are required' },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    if (amount <= 0) {
      const errorResponse = NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    if (payment_method === 'bank' && (!bank_account_name || !bank_account_number || !bank_ifsc || !bank_name)) {
      const errorResponse = NextResponse.json(
        { error: 'Bank account details are required for bank transfer' },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    if (payment_method === 'upi' && !upi_id) {
      const errorResponse = NextResponse.json(
        { error: 'UPI ID is required for UPI transfer' },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    const supabase = createServerClient();

    // Get wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('author_wallet')
      .select('balance')
      .eq('author_id', author_id)
      .single();

    if (walletError || !wallet) {
      const errorResponse = NextResponse.json(
        { error: 'Wallet not found. Please contact support.' },
        { status: 404 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    const availableBalance = parseFloat(wallet.balance || 0);

    if (amount > availableBalance) {
      const errorResponse = NextResponse.json(
        { error: `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}` },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    // Check for pending withdrawals
    const { data: pendingWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('id')
      .eq('author_id', author_id)
      .eq('status', 'pending');

    if (pendingWithdrawals && pendingWithdrawals.length > 0) {
      const errorResponse = NextResponse.json(
        { error: 'You have a pending withdrawal request. Please wait for it to be processed.' },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .insert({
        author_id,
        amount: parseFloat(amount.toFixed(2)),
        status: 'pending',
        bank_account_name: payment_method === 'bank' ? bank_account_name : null,
        bank_account_number: payment_method === 'bank' ? bank_account_number : null,
        bank_ifsc: payment_method === 'bank' ? bank_ifsc : null,
        bank_name: payment_method === 'bank' ? bank_name : null,
        upi_id: payment_method === 'upi' ? upi_id : null,
        payment_method,
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error('Error creating withdrawal request:', withdrawalError);
      const errorResponse = NextResponse.json(
        { error: 'Failed to create withdrawal request', details: withdrawalError.message },
        { status: 500 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    const response = NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal,
    });
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error: any) {
    console.error('Error in POST /api/wallet/withdraw:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    return errorResponse;
  }
}
