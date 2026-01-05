import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST /api/auth/send-otp - Send OTP to mobile number
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile } = body;
    
    if (!mobile || mobile.length < 10) {
      return NextResponse.json(
        { error: 'Invalid mobile number' },
        { status: 400 }
      );
    }
    
    // Static OTP for development (123456)
    const otp = '123456';
    
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // For now, we'll store OTP in database with expiration
    
    const supabase = createServerClient();
    
    // Store OTP in database (you can create an otp_verifications table)
    // For now, we'll use a simple approach - in production, use Redis or database
    
    // TODO: Send SMS via service like Twilio
    // await sendSMS(mobile, `Your OTP is ${otp}`);
    
    // For development, return OTP in response
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Static OTP for development
      otp: otp,
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

