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
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

// POST /api/payments - Create a payment record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      amount, 
      payment_method, 
      transaction_id, 
      subscription_type_id,
      book_id,
      audio_book_id,
    } = body;

    if (!user_id) {
      const errorResponse = NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    if (!transaction_id) {
      const errorResponse = NextResponse.json(
        { error: 'transaction_id is required' },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    const supabase = createServerClient();

    // Create payment record
    const paymentData: any = {
      user_id,
      amount: parseFloat(amount || 0),
      payment_method: payment_method || 'razorpay',
      transaction_id,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    // Add optional fields
    if (book_id) {
      paymentData.book_id = book_id;
    }

    if (audio_book_id) {
      paymentData.audio_book_id = audio_book_id;
    }

    if (subscription_type_id) {
      paymentData.subscription_type_id = subscription_type_id;
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Error creating payment record:', paymentError);
      const errorResponse = NextResponse.json(
        { 
          error: 'Failed to create payment record',
          details: paymentError.message
        },
        { status: 500 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    console.log('✅ Payment record created successfully:', payment.id);

    const response = NextResponse.json({
      success: true,
      payment: payment,
    });

    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error: any) {
    console.error('❌ Error in POST /api/payments:', error);
    const errorResponse = NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    return errorResponse;
  }
}
