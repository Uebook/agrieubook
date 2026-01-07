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

// Initialize Razorpay - must be done inside the function to access runtime environment variables
// In Vercel, environment variables are available at runtime, not at module load time
function getRazorpayInstance() {
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_S10gAhQQEnKuYr';
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'vvNvgwDNluGnA8GkHahHpgtp';

  // Check if secret key is still placeholder
  if (RAZORPAY_KEY_SECRET === 'YOUR_RAZORPAY_TEST_SECRET_KEY' || !RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ WARNING: Razorpay secret key not configured. Using placeholder. Please set RAZORPAY_KEY_SECRET in environment variables.');
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

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

    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_S10gAhQQEnKuYr';
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'vvNvgwDNluGnA8GkHahHpgtp';

    // Log credentials status (without exposing secret)
    console.log('🔑 Razorpay config:', {
      keyId: RAZORPAY_KEY_ID,
      keyIdSet: !!process.env.RAZORPAY_KEY_ID,
      secretSet: !!process.env.RAZORPAY_KEY_SECRET,
      secretLength: RAZORPAY_KEY_SECRET?.length || 0,
    });

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
      console.error('❌ Razorpay API error:', {
        statusCode: razorpayError.statusCode,
        error: razorpayError.error,
        description: razorpayError.description,
        message: razorpayError.message,
        fullError: JSON.stringify(razorpayError, null, 2),
      });
      
      // Check if secret key is placeholder
      if (RAZORPAY_KEY_SECRET === 'YOUR_RAZORPAY_TEST_SECRET_KEY' || !RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay secret key not configured. Please set RAZORPAY_KEY_SECRET in Vercel environment variables. See admin/RAZORPAY_SETUP.md for instructions.');
      }
      
      // Check if it's an authentication error
      if (razorpayError.statusCode === 401 || razorpayError.error?.code === 'BAD_REQUEST_ERROR' || razorpayError.statusCode === 400) {
        const errorMsg = razorpayError.error?.description || razorpayError.description || razorpayError.error?.field || 'Invalid Razorpay credentials';
        const errorCode = razorpayError.error?.code || 'AUTH_ERROR';
        
        // Provide more helpful error message
        const helpfulMsg = `Razorpay authentication failed (${errorCode}): ${errorMsg}.\n\n` +
          `This usually means:\n` +
          `1. The Key ID and Secret Key don't match\n` +
          `2. The credentials are incorrect\n` +
          `3. You're using test keys in production or vice versa\n\n` +
          `Please verify your credentials at: https://dashboard.razorpay.com/app/keys\n` +
          `Make sure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correctly set in Vercel.`;
        
        throw new Error(helpfulMsg);
      }
      
      // Check for other common errors
      if (razorpayError.error?.code === 'INVALID_REQUEST_ERROR') {
        throw new Error(`Invalid Razorpay request: ${razorpayError.error?.description || 'Please check your request parameters'}`);
      }
      
      // Generic error
      const errorMsg = razorpayError.error?.description || razorpayError.description || razorpayError.message || 'Unknown Razorpay error';
      throw new Error(`Razorpay error: ${errorMsg}`);
    }

    const response = NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_S10gAhQQEnKuYr', // Return key for client
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
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message?.includes('not configured') || error.message?.includes('environment variables')) {
      statusCode = 503; // Service Unavailable - configuration issue
    } else if (error.statusCode === 401 || error.statusCode === 400) {
      statusCode = 400; // Bad Request - invalid credentials
    }
    
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error.message || error.description || 'Unknown error',
        code: error.statusCode || error.code,
        hint: error.message?.includes('not configured') 
          ? 'Please configure RAZORPAY_KEY_SECRET in Vercel Dashboard → Settings → Environment Variables'
          : undefined,
      },
      { status: statusCode }
    );
    
    // Add CORS headers to error response
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    
    return errorResponse;
  }
}
