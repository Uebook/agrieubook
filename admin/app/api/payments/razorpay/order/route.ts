import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import Razorpay from 'razorpay';

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

// Initialize Razorpay with test keys
// Get keys from environment variables or use test keys
// For production, set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Test key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_TEST_SECRET_KEY', // Test secret key - REPLACE WITH ACTUAL
});

// Note: Replace 'YOUR_RAZORPAY_TEST_SECRET_KEY' with your actual Razorpay test secret key
// You can get it from: https://dashboard.razorpay.com/app/keys

// POST /api/payments/razorpay/order - Create Razorpay order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', bookId, audioBookId, userId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!bookId && !audioBookId) {
      return NextResponse.json(
        { error: 'Either bookId or audioBookId is required' },
        { status: 400 }
      );
    }

    // Amount in paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: `receipt_${Date.now()}_${bookId || audioBookId}`,
      notes: {
        userId: userId,
        bookId: bookId || null,
        audioBookId: audioBookId || null,
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log('📦 Razorpay order created:', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        userId,
        bookId,
        audioBookId,
      });
    } catch (razorpayError: any) {
      console.error('❌ Razorpay API error:', razorpayError);
      // Check if it's an authentication error
      if (razorpayError.statusCode === 401 || razorpayError.error?.code === 'BAD_REQUEST_ERROR') {
        throw new Error('Invalid Razorpay credentials. Please configure RAZORPAY_KEY_SECRET in environment variables.');
      }
      throw razorpayError;
    }

    const response = NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Return key for client
    });
    
    // Add CORS headers
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Error creating Razorpay order:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error,
      description: error.description,
    });
    
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error.message || error.description || 'Unknown error',
        code: error.statusCode || error.code,
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
