import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import crypto from 'crypto';

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

// POST /api/payments/razorpay/verify - Verify Razorpay payment and create purchase record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      bookId,
      audioBookId,
      amount,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify payment signature
    // Get secret key from environment variables
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_TEST_SECRET_KEY';
    
    // Note: Replace 'YOUR_RAZORPAY_TEST_SECRET_KEY' with your actual Razorpay test secret key
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('❌ Payment signature verification failed');
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    console.log('✅ Payment signature verified successfully');

    // Create purchase record in payments table
    const supabase = createServerClient();
    const paymentData: any = {
      user_id: userId,
      amount: amount || 0,
      payment_method: 'razorpay',
      transaction_id: razorpay_payment_id,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    // Add razorpay_order_id to payment data
    // Note: If your payments table doesn't have this column, remove this line
    paymentData.razorpay_order_id = razorpay_order_id;

    if (bookId) {
      paymentData.book_id = bookId;
    }

    if (audioBookId) {
      paymentData.audio_book_id = audioBookId;
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Error creating payment record:', paymentError);
      return NextResponse.json(
        { 
          error: 'Failed to create payment record',
          details: paymentError.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Payment record created successfully:', payment.id);

    const response = NextResponse.json({
      success: true,
      payment: payment,
      message: 'Payment verified and purchase completed',
    });
    
    // Add CORS headers
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Error verifying payment:', error);
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to verify payment',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
    
    // Add CORS headers to error response
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    
    return errorResponse;
  }
}
