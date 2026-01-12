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
      isMultipart: contentType.includes('multipart') || contentType.includes('form-data'),
    });
    
    // Parse FormData
    const formData = await request.formData();
    
    // Extract form fields
    const userId = formData.get('user_id') as string | null;
    const authorId = formData.get('author_id') as string | null;
    const fullName = formData.get('full_name') as string | null;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const address = formData.get('address') as string | null;
    const bio = formData.get('bio') as string | null;
    const city = formData.get('city') as string | null;
    const state = formData.get('state') as string | null;
    const pincode = formData.get('pincode') as string | null;
    const website = formData.get('website') as string | null;
    const profilePicture = formData.get('profile_picture') as File | null;
    
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
      hasProfilePicture: !!profilePicture,
    });
    
    const supabase = createServerClient();
    
    // Handle profile picture upload if provided
    let profilePictureUrl: string | null = null;
    
    if (profilePicture && profilePicture instanceof File) {
      console.log('📤 Uploading profile picture...');
      
      try {
        // Read file as Buffer
        let fileBuffer: Buffer;
        let fileName: string = 'profile.jpg';
        let contentType: string = 'image/jpeg';
        
        const fileObj = profilePicture as any;
        
        // Read file based on type
        if (fileObj instanceof File) {
          const arrayBuffer = await fileObj.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          fileName = fileObj.name || `profile_${Date.now()}.jpg`;
          contentType = fileObj.type || 'image/jpeg';
        } else if (fileObj instanceof Blob) {
          const arrayBuffer = await fileObj.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          contentType = fileObj.type || 'image/jpeg';
        } else if (typeof fileObj?.arrayBuffer === 'function') {
          const arrayBuffer = await fileObj.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
        } else {
          throw new Error('Unsupported file type');
        }
        
        // Generate unique file name
        // Path structure: {userId}/{timestamp}-{fileName}
        // Don't include 'avatars' in path since bucket is already 'avatars'
        const timestamp = Date.now();
        const fileExt = fileName.split('.').pop() || 'jpg';
        const uniqueFileName = `${targetUserId}/${timestamp}-${fileName}`;
        
        console.log('📤 Uploading to bucket "avatars" with path:', uniqueFileName);
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(uniqueFileName, fileBuffer, {
            contentType: contentType,
            cacheControl: '3600',
            upsert: false,
          });
        
        if (uploadError) {
          console.error('❌ Error uploading profile picture:', uploadError);
          console.error('Upload error details:', {
            message: uploadError.message,
            statusCode: (uploadError as any).statusCode,
            error: uploadError,
            path: uniqueFileName,
            bucket: 'avatars',
          });
          // Continue without profile picture - don't fail the entire update
        } else {
          console.log('✅ File uploaded successfully to path:', uniqueFileName);
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(uniqueFileName);
          
          // Also generate signed URL as fallback
          const { data: signedUrlData } = await supabase.storage
            .from('avatars')
            .createSignedUrl(uniqueFileName, 31536000); // 1 year expiry
          
          profilePictureUrl = signedUrlData?.signedUrl || urlData.publicUrl;
          console.log('✅ Profile picture uploaded successfully:', {
            path: uniqueFileName,
            publicUrl: urlData.publicUrl?.substring(0, 50) + '...',
            signedUrl: signedUrlData?.signedUrl?.substring(0, 50) + '...',
            finalUrl: profilePictureUrl?.substring(0, 50) + '...',
          });
        }
      } catch (uploadError: any) {
        console.error('Error processing profile picture:', uploadError);
        // Continue without profile picture - don't fail the entire update
      }
    }
    
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
    if (profilePictureUrl) {
      updateData.avatar_url = profilePictureUrl;
    }
    
    console.log('📝 Updating user profile:', {
      userId: targetUserId,
      updateData,
    });
    
    // Update user in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single();
    
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
          error: 'User not found',
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
