import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/orders - Get user's order history (purchases)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // Get user purchases from payments table (where purchases are actually stored)
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        book:books(
          id,
          title,
          cover_image_url,
          author_id,
          price,
          is_free
        ),
        audio_book:audio_books(
          id,
          title,
          cover_url,
          author_id,
          is_free
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (paymentsError) {
      console.error('Error fetching purchases:', paymentsError);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: paymentsError.message },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (countError) {
      console.error('Error counting purchases:', countError);
    }

    // Fetch authors separately for all items
    const authorIds = new Set<string>();
    payments?.forEach((payment: any) => {
      if (payment.book?.author_id) authorIds.add(payment.book.author_id);
      if (payment.audio_book?.author_id) authorIds.add(payment.audio_book.author_id);
    });

    let authorsMap: Record<string, any> = {};
    if (authorIds.size > 0) {
      const { data: authors, error: authorsError } = await supabase
        .from('authors')
        .select('id, name')
        .in('id', Array.from(authorIds));

      if (!authorsError && authors) {
        authors.forEach((author: any) => {
          authorsMap[author.id] = author;
        });
      }
    }

    // Format response - handle both books and audio books
    const orders = payments?.map((payment: any) => {
      const item = payment.book || payment.audio_book;
      const itemType = payment.book ? 'book' : 'audio_book';
      const authorId = item?.author_id;
      const author = authorId ? authorsMap[authorId] : null;
      
      return {
        id: payment.id,
        orderNumber: `ORD-${payment.id.substring(0, 8).toUpperCase()}`,
        date: payment.created_at,
        status: payment.status || 'completed',
        total: parseFloat(payment.amount?.toString() || '0'),
        paymentMethod: payment.payment_method || 'razorpay',
        books: item
          ? [
              {
                id: item.id,
                title: item.title,
                cover: item.cover_image_url || item.cover_url,
                cover_image_url: item.cover_image_url || item.cover_url,
                author: {
                  id: author?.id || authorId,
                  name: author?.name || 'Unknown',
                },
                price: item.price ? parseFloat(item.price?.toString() || '0') : 0,
                isFree: item.is_free || (item.price ? parseFloat(item.price?.toString() || '0') === 0 : true),
                type: itemType,
              },
            ]
          : [],
      };
    }) || [];

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

