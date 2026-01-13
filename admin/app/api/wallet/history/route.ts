import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/wallet/history - Get author payment history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('author_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'payments' or 'withdrawals'

    if (!authorId) {
      return NextResponse.json(
        { error: 'author_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    if (type === 'withdrawals') {
      // Get withdrawal history
      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { count } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', authorId);

      if (withdrawalError) {
        return NextResponse.json(
          { error: 'Failed to fetch withdrawals', details: withdrawalError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        withdrawals: withdrawals || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } else {
      // Get payment history
      const { data: payments, error: paymentError } = await supabase
        .from('author_payment_history')
        .select(`
          *,
          book:books(id, title, cover_image_url),
          audio_book:audio_books(id, title, cover_url),
          buyer:users(id, name, email)
        `)
        .eq('author_id', authorId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { count } = await supabase
        .from('author_payment_history')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', authorId);

      if (paymentError) {
        return NextResponse.json(
          { error: 'Failed to fetch payment history', details: paymentError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        payments: payments || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }
  } catch (error: any) {
    console.error('Error in GET /api/wallet/history:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
