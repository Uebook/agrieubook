import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST /api/purchase - Purchase a book
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, book_id, payment_method, transaction_id } = body;

    if (!user_id || !book_id) {
      return NextResponse.json(
        { error: 'user_id and book_id are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if book exists and get price
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, price, is_free, author_id')
      .eq('id', book_id)
      .single();

    if (bookError || !book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', user_id)
      .eq('book_id', book_id)
      .single();

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Book already purchased' },
        { status: 400 }
      );
    }

    const amount = book.is_free ? 0 : parseFloat(book.price?.toString() || '0');

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id,
        book_id,
        amount,
        payment_method: payment_method || 'UPI',
        transaction_id: transaction_id || `TXN-${Date.now()}`,
        status: 'completed',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      );
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('user_purchases')
      .insert({
        user_id,
        book_id,
        payment_id: payment.id,
        amount,
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError);
      // Rollback payment
      await supabase.from('payments').delete().eq('id', payment.id);
      return NextResponse.json(
        { error: 'Failed to complete purchase' },
        { status: 500 }
      );
    }

    // Update user's books_purchased and total_spent
    await supabase.rpc('increment_user_purchases', {
      user_id_param: user_id,
      amount_param: amount,
    });

    // Create notification for purchase
    await supabase.from('notifications').insert({
      user_id,
      title: 'Purchase Successful',
      message: `You've successfully purchased "${book.title}"`,
      icon: '✅',
      type: 'success',
      action_type: 'navigate',
      action_screen: 'Library',
    });

    return NextResponse.json({
      success: true,
      message: 'Book purchased successfully',
      purchase: {
        id: purchase.id,
        book_id: purchase.book_id,
        amount: purchase.amount,
        purchased_at: purchase.purchased_at,
      },
      payment: {
        id: payment.id,
        transaction_id: payment.transaction_id,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

