import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

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
      return NextResponse.json(
        { error: 'author_id and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (payment_method === 'bank' && (!bank_account_name || !bank_account_number || !bank_ifsc || !bank_name)) {
      return NextResponse.json(
        { error: 'Bank account details are required for bank transfer' },
        { status: 400 }
      );
    }

    if (payment_method === 'upi' && !upi_id) {
      return NextResponse.json(
        { error: 'UPI ID is required for UPI transfer' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('author_wallet')
      .select('balance')
      .eq('author_id', author_id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found. Please contact support.' },
        { status: 404 }
      );
    }

    const availableBalance = parseFloat(wallet.balance || 0);

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Check for pending withdrawals
    const { data: pendingWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('id')
      .eq('author_id', author_id)
      .eq('status', 'pending');

    if (pendingWithdrawals && pendingWithdrawals.length > 0) {
      return NextResponse.json(
        { error: 'You have a pending withdrawal request. Please wait for it to be processed.' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Failed to create withdrawal request', details: withdrawalError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal,
    });
  } catch (error: any) {
    console.error('Error in POST /api/wallet/withdraw:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
