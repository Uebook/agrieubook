import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST /api/auth/login - Email/password login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const supabase = createServerClient();
    
    // Check if user exists with admin role
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .in('role', ['admin', 'publisher', 'author']) // Allow admin, publisher, or author to login
      .single();
    
    if (error || !user) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Verify password - REQUIRED for security
    let isValid = false;
    
    // Check password_hash field first
    if (user.password_hash) {
      // Compare password (password_hash should contain the password in plain text for now)
      // In production, use bcrypt: isValid = await bcrypt.compare(password, user.password_hash);
      isValid = user.password_hash === password;
    } 
    // Check password field if it exists
    else if ((user as any).password) {
      isValid = (user as any).password === password;
    }
    // If no password field exists, reject login
    else {
      console.error('User has no password set. Login rejected for security.');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Reject login if password doesn't match
    if (!isValid) {
      console.error('Password mismatch for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    
    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      token: user.id, // Simple token for now (use JWT in production)
    });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}

