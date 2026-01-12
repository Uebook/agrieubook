import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// Increase function timeout for file uploads (max 60s on Pro plan, 10s on Hobby)
export const maxDuration = 60;

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

// PUT /api/profile/update - Update user profile with FormData (supports file upload)
// Also support POST for better React Native compatibility
export async function PUT(request: NextRequest) {
  return handleProfileUpdate(request);
}

export async function POST(request: NextRequest) {
  return handleProfileUpdate(request);
}

async function handleProfileUpdate(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    console.log('📥 Profile update API called:', {
      contentType,
      method: request.method,
      url: request.url,
      isJSON: contentType.includes('application/json'),
    });
    
    // Parse JSON body (no more FormData)
    const body = await request.json();
    
    // Extract fields from JSON body
    const userId = body.user_id as string | null;
    const authorId = body.author_id as string | null;
    const fullName = body.full_name as string | null;
    const email = body.email as string | null;
    const phone = body.phone as string | null;
    const address = body.address as string | null;
    const bio = body.bio as string | null;
    const city = body.city as string | null;
    const state = body.state as string | null;
    const pincode = body.pincode as string | null;
    const website = body.website as string | null;
    const avatarUrl = body.avatar_url as string | null; // Avatar URL from Supabase
    
    // Determine which user ID to use (user_id takes precedence over author_id)
    const targetUserId = userId || authorId;
    
    if (!targetUserId) {
      const errorResponse = NextResponse.json(
        { error: 'Missing user_id or author_id' },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(targetUserId)) {
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'Invalid user_id or author_id format',
          details: `Expected UUID format (e.g., "550e8400-e29b-41d4-a716-446655440000"), but received: "${targetUserId}". The user_id must be a valid UUID.`,
        },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }
    
    console.log('📝 Profile update request:', {
      userId: targetUserId,
      hasFullName: !!fullName,
      hasEmail: !!email,
      hasPhone: !!phone,
      hasAddress: !!address,
      hasBio: !!bio,
      hasCity: !!city,
      hasState: !!state,
      hasPincode: !!pincode,
      hasWebsite: !!website,
      hasAvatarUrl: !!avatarUrl,
    });
    
    const supabase = createServerClient();
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (fullName !== null && fullName !== undefined) {
      updateData.name = fullName.trim() || null;
    }
    if (email !== null && email !== undefined) {
      updateData.email = email.trim() || null;
    }
    if (phone !== null && phone !== undefined) {
      updateData.mobile = phone.trim() || null;
    }
    if (address !== null && address !== undefined) {
      updateData.address = address.trim() || null;
    }
    if (bio !== null && bio !== undefined) {
      updateData.bio = bio.trim() || null;
    }
    if (city !== null && city !== undefined) {
      updateData.city = city.trim() || null;
    }
    if (state !== null && state !== undefined) {
      updateData.state = state.trim() || null;
    }
    if (pincode !== null && pincode !== undefined) {
      updateData.pincode = pincode.trim() || null;
    }
    if (website !== null && website !== undefined) {
      updateData.website = website.trim() || null;
    }
    if (avatarUrl) {
      updateData.avatar_url = avatarUrl;
    }
    
    console.log('📝 Updating user profile:', {
      userId: targetUserId,
      updateData,
    });
    
    // First, check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', targetUserId)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user existence:', checkError);
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'Failed to check user',
          details: checkError.message || 'Unknown error',
        },
        { status: 500 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }
    
    if (!existingUser) {
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'User not found',
          details: `No user found with ID: ${targetUserId}`,
        },
        { status: 404 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }
    
    // Update user in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .maybeSingle();
    
    if (updateError) {
      console.error('Error updating user profile:', updateError);
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'Failed to update profile',
          details: updateError.message || 'Unknown error',
        },
        { status: 500 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }
    
    if (!updatedUser) {
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'User not found after update',
          details: `User with ID ${targetUserId} was not found after update operation`,
        },
        { status: 404 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }
    
    console.log('✅ Profile updated successfully');
    
    // Return response in the format expected by the mobile app
    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedUser,
        profile_picture: updatedUser.avatar_url || profilePictureUrl,
      },
    });
    
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error: any) {
    console.error('Error in profile update:', error);
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    return errorResponse;
  }
}
