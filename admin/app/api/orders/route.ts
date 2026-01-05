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

    // Get user purchases with book details
    const { data: purchases, error: purchasesError } = await supabase
      .from('user_purchases')
      .select(`
        *,
        book:books(
          id,
          title,
          cover_image_url,
          author:authors(id, name),
          price
        ),
        payment:payments(
          id,
          payment_method,
          transaction_id,
          status,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('user_purchases')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting purchases:', countError);
    }

    // Format response
    const orders = purchases?.map((purchase) => ({
      id: purchase.id,
      orderNumber: `ORD-${purchase.id.substring(0, 8).toUpperCase()}`,
      date: purchase.purchased_at,
      status: purchase.payment?.status || 'completed',
      total: parseFloat(purchase.amount.toString()),
      paymentMethod: purchase.payment?.payment_method || 'UPI',
      books: purchase.book
        ? [
            {
              id: purchase.book.id,
              title: purchase.book.title,
              cover: purchase.book.cover_image_url,
              author: {
                name: purchase.book.author?.name || 'Unknown',
              },
              price: parseFloat(purchase.book.price?.toString() || '0'),
              isFree: parseFloat(purchase.book.price?.toString() || '0') === 0,
            },
          ]
        : [],
    })) || [];

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

