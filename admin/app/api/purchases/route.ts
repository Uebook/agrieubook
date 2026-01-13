import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/purchases - Get all purchases (admin) with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const bookType = searchParams.get('bookType'); // 'book', 'audio_book', or 'all'

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // Get purchases from payments table (primary source)
    // Exclude subscription purchases - only show book/audio book purchases
    let paymentsQuery = supabase
      .from('payments')
      .select(`
        *,
        user:users(id, name, email),
        book:books(id, title, cover_image_url, category_id, category:categories(id, name)),
        audio_book:audio_books(id, title, cover_url, category_id, category:categories(id, name))
      `)
      .eq('status', 'completed') // Only completed payments
      .is('subscription_type_id', null) // Exclude subscription purchases
      .order('created_at', { ascending: false });

    // Apply book type filter
    if (bookType === 'book') {
      paymentsQuery = paymentsQuery.not('book_id', 'is', null);
    } else if (bookType === 'audio_book') {
      paymentsQuery = paymentsQuery.not('audio_book_id', 'is', null);
    }
    // If 'all' or no filter, get both

    const { data: payments, error: paymentsError } = await paymentsQuery;

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return NextResponse.json(
        { error: 'Failed to fetch purchases', details: paymentsError.message },
        { status: 500 }
      );
    }

    // Transform payments to purchases format
    let purchases = (payments || []).map((payment: any) => ({
      id: payment.id,
      user_id: payment.user_id,
      book_id: payment.book_id,
      audio_book_id: payment.audio_book_id,
      amount: parseFloat(payment.amount) || 0,
      purchased_at: payment.created_at || payment.purchased_at,
      user: payment.user,
      book: payment.book,
      audio_book: payment.audio_book,
      book_type: payment.audio_book_id ? 'audio_book' : 'book',
      payment: {
        payment_method: payment.payment_method,
        transaction_id: payment.transaction_id,
        status: payment.status,
      },
    }));

    // Filter by category if specified
    if (category && category !== 'all') {
      purchases = purchases.filter((p: any) => 
        (p.book && (p.book.category_id === category || p.book.category?.id === category)) ||
        (p.audio_book && (p.audio_book.category_id === category || p.audio_book.category?.id === category))
      );
    }

    // Sort by date (newest first)
    purchases.sort((a: any, b: any) => {
      const dateA = new Date(a.purchased_at || 0).getTime();
      const dateB = new Date(b.purchased_at || 0).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const total = purchases.length;
    const paginatedPurchases = purchases.slice(offset, offset + limit);

    return NextResponse.json({
      purchases: paginatedPurchases,
      pagination: {
        page,
        limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/purchases:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

