import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST /api/auth/verify-otp - Verify OTP and login/register user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, otp } = body;
    
    if (!mobile || !otp) {
      return NextResponse.json(
        { error: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }
    
    // Static OTP verification (123456)
    const staticOTP = '123456';
    
    if (otp !== staticOTP) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please enter 123456' },
        { status: 401 }
      );
    }
    
    // TODO: In production, verify OTP from database/Redis
    // const isValid = await verifyOTP(mobile, otp);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    // }
    
    const supabase = createServerClient();
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('mobile', mobile)
      .single();
    
    let user;
    
    if (existingUser) {
      // User exists - login
      user = existingUser;
    } else {
      // New user - create account
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          mobile,
          name: `User ${mobile.slice(-4)}`,
          email: null,
          role: 'reader', // Default role, can be changed later
          status: 'active',
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
      
      user = newUser;
    }
    
    // Return user data (in production, return JWT token instead)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      // TODO: Generate JWT token for authentication
      // token: generateJWT(user),
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

