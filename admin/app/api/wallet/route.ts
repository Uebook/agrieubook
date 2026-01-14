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

// GET /api/wallet - Get author wallet balance and summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('author_id');

    if (!authorId) {
      const errorResponse = NextResponse.json(
        { error: 'author_id is required' },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    const supabase = createServerClient();

    // Get or create wallet
    let { data: wallet, error: walletError } = await supabase
      .from('author_wallet')
      .select('*')
      .eq('author_id', authorId)
      .single();

    if (walletError && walletError.code === 'PGRST116') {
      // Wallet doesn't exist, create it
      const { data: newWallet, error: createError } = await supabase
        .from('author_wallet')
        .insert({
          author_id: authorId,
          balance: 0,
          total_earnings: 0,
          total_withdrawn: 0,
        })
        .select()
        .single();

      if (createError) {
        const errorResponse = NextResponse.json(
          { error: 'Failed to create wallet', details: createError.message },
          { status: 500 }
        );
        Object.entries(getCorsHeaders()).forEach(([key, value]) => {
          errorResponse.headers.set(key, value);
        });
        return errorResponse;
      }
      wallet = newWallet;
    } else if (walletError) {
      const errorResponse = NextResponse.json(
        { error: 'Failed to fetch wallet', details: walletError.message },
        { status: 500 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    // Get recent payment history (last 10)
    const { data: recentPayments } = await supabase
      .from('author_payment_history')
      .select(`
        *,
        book:books(id, title, cover_image_url),
        audio_book:audio_books(id, title, cover_url),
        buyer:users(id, name)
      `)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get pending withdrawal requests
    const { data: pendingWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('author_id', authorId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    const response = NextResponse.json({
      success: true,
      wallet: {
        balance: parseFloat(wallet.balance || 0),
        total_earnings: parseFloat(wallet.total_earnings || 0),
        total_withdrawn: parseFloat(wallet.total_withdrawn || 0),
      },
      recent_payments: recentPayments || [],
      pending_withdrawals: pendingWithdrawals || [],
    });
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error: any) {
    console.error('Error in GET /api/wallet:', error);
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
