import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, mobile, password, role, interests } = body;
    
    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate mobile number
    if (mobile.length < 10) {
      return NextResponse.json(
        { error: 'Invalid mobile number' },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ['reader', 'author'];
    const userRole = validRoles.includes(role) ? role : 'reader';
    
    const supabase = createServerClient();
    
    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 409 }
      );
    }
    
    // Check if mobile already exists
    const { data: existingMobile } = await supabase
      .from('users')
      .select('id')
      .eq('mobile', mobile)
      .single();
    
    if (existingMobile) {
      return NextResponse.json(
        { error: 'Mobile number already registered. Please login instead.' },
        { status: 409 }
      );
    }
    
    // TODO: Hash password with bcrypt before storing
    // For now, we'll store it as-is (NOT SECURE - implement hashing in production!)
    // const passwordHash = await bcrypt.hash(password, 10);
    
    // Create new user
    const userData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      role: userRole,
      status: 'active',
      // password_hash: passwordHash, // Uncomment when implementing password hashing
    };
    
    // Add interests only if column exists (handle gracefully if not)
    if (interests && Array.isArray(interests) && interests.length > 0) {
      userData.interests = interests;
    }
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating user:', createError);
      console.error('Error details:', JSON.stringify(createError, null, 2));
      
      // Handle unique constraint violations
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'Email or mobile number already exists' },
          { status: 409 }
        );
      }
      
      // Handle column doesn't exist error
      if (createError.message?.includes('column') && createError.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database column missing. Please run: ALTER TABLE users ADD COLUMN interests TEXT[] DEFAULT \'{}\';',
            details: createError.message 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create account. Please try again.',
          details: createError.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
    
    // Return user data (without password)
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
        interests: newUser.interests || [],
      },
      // TODO: Generate JWT token for authentication
      // token: generateJWT(newUser),
    }, { status: 201 });
  } catch (error) {
    console.error('Error in register:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

