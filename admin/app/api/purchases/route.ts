import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/purchases - Get all purchases (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // Get purchases with user and book details
    const { data: purchases, error: purchasesError } = await supabase
      .from('user_purchases')
      .select(`
        *,
        user:users(id, name, email),
        book:books(id, title, cover_image_url),
        payment:payments(id, payment_method, transaction_id, status)
      `)
      .order('purchased_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError);
      return NextResponse.json(
        { error: 'Failed to fetch purchases' },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('user_purchases')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting purchases:', countError);
    }

    return NextResponse.json({
      purchases: purchases || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/purchases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

