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

// PUT /api/profile/update - Update user profile with JSON (avatar_url from Supabase)
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
      isJSON: contentType.includes('application/json'),
      allHeaders: Object.fromEntries(request.headers.entries()),
    });
    
    // Support both FormData (with file) and JSON (without file)
    const isFormData = contentType.includes('multipart') || contentType.includes('form-data');
    
    let userId: string | null = null;
    let authorId: string | null = null;
    let fullName: string | null = null;
    let email: string | null = null;
    let phone: string | null = null;
    let address: string | null = null;
    let bio: string | null = null;
    let city: string | null = null;
    let state: string | null = null;
    let pincode: string | null = null;
    let website: string | null = null;
    let profilePicture: File | null = null;
    let avatarUrl: string | null = null;
    
    if (isFormData) {
      // Parse FormData (with file upload)
      let formData: FormData;
      try {
        formData = await request.formData();
        console.log('✅ FormData parsed successfully');
      } catch (formDataError: any) {
        console.error('❌ Error parsing FormData:', formDataError);
        const errorResponse = NextResponse.json(
          {
            success: false,
            error: 'Failed to parse FormData',
            details: formDataError.message || 'Unknown error parsing form data',
          },
          { status: 400 }
        );
        Object.entries(getCorsHeaders()).forEach(([key, value]) => {
          errorResponse.headers.set(key, value);
        });
        return errorResponse;
      }
      
      userId = formData.get('user_id') as string | null;
      authorId = formData.get('author_id') as string | null;
      fullName = formData.get('full_name') as string | null;
      email = formData.get('email') as string | null;
      phone = formData.get('phone') as string | null;
      address = formData.get('address') as string | null;
      bio = formData.get('bio') as string | null;
      city = formData.get('city') as string | null;
      state = formData.get('state') as string | null;
      pincode = formData.get('pincode') as string | null;
      website = formData.get('website') as string | null;
      
      const profilePictureEntry = formData.get('profile_picture');
      console.log('📸 Profile picture entry:', {
        type: typeof profilePictureEntry,
        isFile: profilePictureEntry instanceof File,
        isBlob: profilePictureEntry instanceof Blob,
        hasName: profilePictureEntry && typeof (profilePictureEntry as any).name !== 'undefined',
        hasType: profilePictureEntry && typeof (profilePictureEntry as any).type !== 'undefined',
      });
      
      // Handle both File objects and React Native FormData format
      if (profilePictureEntry instanceof File) {
        profilePicture = profilePictureEntry;
      } else if (profilePictureEntry && typeof profilePictureEntry === 'object') {
        // React Native might send it as a Blob or similar
        // Convert to File if possible
        const entry = profilePictureEntry as any;
        if (entry instanceof Blob || (entry.constructor && entry.constructor.name === 'Blob')) {
          const blobName = (entry as any).name || `profile_${Date.now()}.jpg`;
          const blobType = (entry as any).type || 'image/jpeg';
          profilePicture = new File([entry], blobName, { type: blobType });
        } else {
          // If it's not a File or Blob, try to get it as File
          profilePicture = profilePictureEntry as File;
        }
      }
    } else {
      // Parse JSON body (without file)
      let body: any;
      try {
        body = await request.json();
      } catch (parseError) {
        const errorResponse = NextResponse.json(
          {
            success: false,
            error: 'Invalid request body',
            details: 'Request body must be valid JSON or FormData',
          },
          { status: 400 }
        );
        Object.entries(getCorsHeaders()).forEach(([key, value]) => {
          errorResponse.headers.set(key, value);
        });
        return errorResponse;
      }
      
      userId = body.user_id as string | null;
      authorId = body.author_id as string | null;
      fullName = body.full_name as string | null;
      email = body.email as string | null;
      phone = body.phone as string | null;
      address = body.address as string | null;
      bio = body.bio as string | null;
      city = body.city as string | null;
      state = body.state as string | null;
      pincode = body.pincode as string | null;
      website = body.website as string | null;
      avatarUrl = body.avatar_url as string | null;
    }
    
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
      hasAvatarUrl: !!avatarUrl,
    });
    
    const supabase = createServerClient();
    
    // Handle profile picture upload if provided (FormData)
    // React Native FormData might send as Blob or File-like object
    if (profilePicture) {
      console.log('📤 Uploading profile picture to Supabase...');
      console.log('📸 Profile picture details:', {
        isFile: profilePicture instanceof File,
        isBlob: profilePicture instanceof Blob,
        hasName: !!(profilePicture as any).name,
        hasType: !!(profilePicture as any).type,
        hasSize: !!(profilePicture as any).size,
      });
      
      try {
        let fileBuffer: Buffer;
        let fileName: string;
        let contentType: string;
        
        const profilePic = profilePicture as any;
        if (profilePicture instanceof File) {
          // Standard File object
          const arrayBuffer = await profilePicture.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          fileName = profilePicture.name || `profile_${Date.now()}.jpg`;
          contentType = profilePicture.type || 'image/jpeg';
        } else {
          // Handle Blob or other file-like objects
          let arrayBuffer: ArrayBuffer;
          if (profilePic && typeof profilePic.arrayBuffer === 'function') {
            arrayBuffer = await profilePic.arrayBuffer();
          } else {
            // Try to cast as Blob and get arrayBuffer
            const blobLike = profilePicture as any;
            if (blobLike && typeof blobLike.arrayBuffer === 'function') {
              arrayBuffer = await blobLike.arrayBuffer();
            } else {
              throw new Error('Invalid file format');
            }
          }
          fileBuffer = Buffer.from(arrayBuffer);
          fileName = profilePic.name || `profile_${Date.now()}.jpg`;
          contentType = profilePic.type || 'image/jpeg';
        }
        
        // Generate unique file name
        const timestamp = Date.now();
        // Sanitize fileName to remove any path separators
        const sanitizedFileName = fileName.replace(/[\/\\]/g, '_');
        const uniqueFileName = `${targetUserId}/${timestamp}-${sanitizedFileName}`;
        
        console.log('📤 Uploading to bucket "avatars" with path:', uniqueFileName, {
          fileSize: fileBuffer.length,
          contentType,
        });
        
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
          
          avatarUrl = signedUrlData?.signedUrl || urlData.publicUrl;
          console.log('✅ Profile picture uploaded, URL:', avatarUrl?.substring(0, 50) + '...');
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
        profile_picture: updatedUser.avatar_url || avatarUrl,
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
