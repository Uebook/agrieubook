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

    // For direct payments, order_id and signature might not be present
    // Razorpay creates the order internally when opening checkout directly
    console.log('🔍 Verification request received:', {
      hasOrderId: !!razorpay_order_id,
      hasPaymentId: !!razorpay_payment_id,
      hasSignature: !!razorpay_signature,
      orderId: razorpay_order_id || 'null',
      paymentId: razorpay_payment_id || 'null',
      userId: userId || 'null',
    });

    if (!razorpay_payment_id) {
      console.error('❌ Missing required field: payment_id');
      return NextResponse.json(
        { error: 'Missing payment ID (payment_id is required)' },
        { status: 400 }
      );
    }

    // Signature is optional - we can verify via Razorpay API if missing
    if (!razorpay_signature) {
      console.warn('⚠️ Payment signature not provided, will verify via Razorpay API');
    }

    // If order_id is not provided, we need to fetch it from Razorpay using payment_id
    // Or skip signature verification for direct payments (less secure but works)
    let orderId = razorpay_order_id;
    
    // If order_id is missing, try to get it from Razorpay payment details
    if (!orderId) {
      console.log('⚠️ Order ID not provided, attempting to fetch from Razorpay...');
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_S10srfDgCfFXIL',
          key_secret: process.env.RAZORPAY_KEY_SECRET || 'wKdMJW6om9TdsV2XwWQyzcdh',
        });
        
        // Fetch payment details to get order_id
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        orderId = payment.order_id;
        console.log('✅ Retrieved order_id from Razorpay:', orderId);
      } catch (fetchError: any) {
        console.error('❌ Failed to fetch order_id from Razorpay:', fetchError.message);
        // Continue without order_id - we'll verify signature differently
        orderId = `direct_${razorpay_payment_id}`;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify payment - Use Razorpay API verification (more reliable for direct payments)
    // Get secret key from environment variables
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'wKdMJW6om9TdsV2XwWQyzcdh';
    
    let signatureVerified = false;
    let verifiedOrderId = orderId;
    
    // First, try signature verification if signature is provided
    if (razorpay_signature && orderId && orderId !== `direct_${razorpay_payment_id}`) {
      const signatureText = `${orderId}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(signatureText)
        .digest('hex');

      if (generatedSignature === razorpay_signature) {
        signatureVerified = true;
        console.log('✅ Signature verified with order_id');
      } else {
        console.warn('⚠️ Signature verification failed, will verify via Razorpay API');
      }
    }
    
    // Always verify via Razorpay API (more reliable, especially for direct payments)
    if (!signatureVerified || !razorpay_signature) {
      console.log('🔍 Verifying payment via Razorpay API...');
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_S10srfDgCfFXIL',
          key_secret: keySecret,
        });
        
        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        
        console.log('📦 Payment details from Razorpay:', {
          id: payment.id,
          status: payment.status,
          order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
        });
        
        // Verify payment status
        if (payment.status === 'authorized' || payment.status === 'captured') {
          signatureVerified = true;
          verifiedOrderId = payment.order_id || orderId;
          console.log('✅ Payment verified via Razorpay API');
          console.log('✅ Order ID from Razorpay:', verifiedOrderId);
        } else {
          console.error('❌ Payment status is not valid:', payment.status);
          return NextResponse.json(
            { error: `Payment status is ${payment.status}, expected 'authorized' or 'captured'` },
            { status: 400 }
          );
        }
      } catch (verifyError: any) {
        console.error('❌ Razorpay API verification failed:', verifyError.message);
        return NextResponse.json(
          { 
            error: 'Failed to verify payment with Razorpay',
            details: verifyError.message || 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    if (!signatureVerified) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
    
    // Use the verified order_id
    orderId = verifiedOrderId;

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
    // Use the verified order_id from Razorpay API
    if (orderId && orderId !== `direct_${razorpay_payment_id}`) {
      paymentData.razorpay_order_id = orderId;
    } else {
      // Fallback: use payment_id as reference
      paymentData.razorpay_order_id = `direct_${razorpay_payment_id}`;
    }

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
