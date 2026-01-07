import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST /api/purchase - Purchase a book or audio book (no verification, direct purchase)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, book_id, audio_book_id, payment_method, transaction_id, amount } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (!book_id && !audio_book_id) {
      return NextResponse.json(
        { error: 'Either book_id or audio_book_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    let item: any = null;
    let itemTitle = '';
    let itemPrice = 0;

    // Get book or audio book details
    if (book_id) {
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

      item = book;
      itemTitle = book.title;
      itemPrice = book.is_free ? 0 : parseFloat(book.price?.toString() || amount || '0');
    } else if (audio_book_id) {
      const { data: audioBook, error: audioBookError } = await supabase
        .from('audio_books')
        .select('id, title, price, is_free, author_id')
        .eq('id', audio_book_id)
        .single();

      if (audioBookError || !audioBook) {
        return NextResponse.json(
          { error: 'Audio book not found' },
          { status: 404 }
        );
      }

      item = audioBook;
      itemTitle = audioBook.title;
      itemPrice = audioBook.is_free ? 0 : parseFloat(audioBook.price?.toString() || amount || '0');
    }

    // Check if already purchased (check payments table)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'completed')
      .or(`${book_id ? `book_id.eq.${book_id}` : ''},${audio_book_id ? `audio_book_id.eq.${audio_book_id}` : ''}`)
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Item already purchased' },
        { status: 400 }
      );
    }

    // Create payment record directly (no verification)
    const paymentData: any = {
      user_id,
      amount: itemPrice,
      payment_method: payment_method || 'razorpay',
      transaction_id: transaction_id || `TXN-${Date.now()}`,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    if (book_id) {
      paymentData.book_id = book_id;
    }

    if (audio_book_id) {
      paymentData.audio_book_id = audio_book_id;
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json(
        { 
          error: 'Failed to create payment record',
          details: paymentError.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Payment record created successfully:', payment.id);

    // Create notification for purchase
    try {
      await supabase.from('notifications').insert({
        user_id,
        title: 'Purchase Successful',
        message: `You've successfully purchased "${itemTitle}"`,
        icon: '✅',
        type: 'success',
        action_type: 'navigate',
        action_screen: 'Library',
      });
    } catch (notifError) {
      console.warn('Failed to create notification:', notifError);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase completed successfully',
      payment: {
        id: payment.id,
        transaction_id: payment.transaction_id,
        status: payment.status,
        amount: payment.amount,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/purchase:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

