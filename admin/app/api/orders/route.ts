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
          author:authors(id, name),
          price,
          is_free
        ),
        audio_book:audio_books(
          id,
          title,
          cover_url,
          author:authors(id, name),
          price,
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

    // Format response - handle both books and audio books
    const orders = payments?.map((payment) => {
      const item = payment.book || payment.audio_book;
      const itemType = payment.book ? 'book' : 'audio_book';
      
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
                  id: item.author?.id,
                  name: item.author?.name || 'Unknown',
                },
                price: parseFloat(item.price?.toString() || '0'),
                isFree: item.is_free || parseFloat(item.price?.toString() || '0') === 0,
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

