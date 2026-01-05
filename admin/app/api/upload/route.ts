import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST /api/upload - Generate upload URL for direct upload to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    const { fileName, fileType, bucket, folder } = body;
    
    if (!fileName || !bucket) {
      return NextResponse.json(
        { error: 'Missing fileName or bucket' },
        { status: 400 }
      );
    }
    
    // Generate unique file name
    const timestamp = Date.now();
    const uniqueFileName = folder
      ? `${folder}/${timestamp}-${fileName}`
      : `${timestamp}-${fileName}`;
    
    // Generate presigned URL for direct upload
    // Note: Supabase doesn't have presigned upload URLs like S3
    // Instead, we'll return the path and client uploads directly
    
    // Alternative: Use Supabase Storage upload token
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(uniqueFileName);
    
    if (uploadError) {
      console.error('Error creating upload URL:', uploadError);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      path: uniqueFileName,
      token: uploadData.token,
      expiresAt: uploadData.expiresAt,
    });
  } catch (error) {
    console.error('Error in POST /api/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Alternative: Direct upload endpoint (for smaller files)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const folder = formData.get('folder') as string;
    
    if (!file || !bucket) {
      return NextResponse.json(
        { error: 'Missing file or bucket' },
        { status: 400 }
      );
    }
    
    // Generate unique file name
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = folder
      ? `${folder}/${timestamp}.${fileExt}`
      : `${timestamp}.${fileExt}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);
    
    return NextResponse.json({
      success: true,
      path: uniqueFileName,
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Error in PUT /api/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




