/**
 * Test Upload API Endpoint
 * Simple endpoint to test file uploads to Supabase Storage
 * Can be tested with curl or Postman
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Upload API called');
    
    const supabase = createServerClient();
    const formData = await request.formData();
    const file = formData.get('file');
    const fileTypeParam = formData.get('fileType');
    const fileType = (typeof fileTypeParam === 'string' ? fileTypeParam : null) || 'application/octet-stream';
    
    console.log('📥 Test upload request:', {
      hasFile: !!file,
      fileType: typeof file,
      fileConstructor: file?.constructor?.name,
      fileTypeParam: fileType,
    });
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Send file as FormData with key "file"' },
        { status: 400 }
      );
    }
    
    // Determine file type and bucket
    const fileName = (file as File).name || 'test-file';
    const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPdf = fileName.match(/\.pdf$/i);
    
    const bucket = isImage ? 'books' : (isPdf ? 'books' : 'books');
    const folder = isImage ? 'covers' : (isPdf ? 'pdfs' : 'test');
    
    console.log('📄 File info:', {
      fileName,
      isImage,
      isPdf,
      bucket,
      folder,
    });
    
    // Read file as Buffer
    let fileBuffer: Buffer;
    try {
      const fileObj = file as File;
      
      if (fileObj instanceof File) {
        const arrayBuffer = await fileObj.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        console.log('✅ File read as File object, size:', fileBuffer.length);
      } else if (fileObj && typeof (fileObj as any).arrayBuffer === 'function') {
        // Has arrayBuffer method (Blob-like or File-like)
        const arrayBuffer = await (fileObj as any).arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        console.log('✅ File read via arrayBuffer method, size:', fileBuffer.length);
      } else {
        // In Node.js, FormData.get() should return File objects
        // If we get here, something unexpected happened
        const fileAny = fileObj as any;
        const fileType = typeof fileAny;
        const constructorName = fileAny?.constructor?.name || 'unknown';
        throw new Error(`Cannot read file: Unsupported file type. Got: ${fileType}, constructor: ${constructorName}`);
      }
    } catch (readError: any) {
      console.error('❌ Error reading file:', readError);
      return NextResponse.json(
        { 
          error: 'Failed to read file: ' + readError.message,
          details: {
            fileType: typeof file,
            constructor: file?.constructor?.name,
          }
        },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = fileName.split('.').pop() || 'bin';
    const uniqueFileName = `${folder}/${timestamp}-${fileName}`;
    
    console.log('📤 Uploading to Supabase:', {
      bucket,
      path: uniqueFileName,
      size: fileBuffer.length,
    });
    
    // Ensure fileBuffer is defined
    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'File buffer is undefined' },
        { status: 400 }
      );
    }
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, fileBuffer as Buffer, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError);
      return NextResponse.json(
        { 
          error: 'Failed to upload to Supabase: ' + uploadError.message,
          details: uploadError
        },
        { status: 500 }
      );
    }
    
    console.log('✅ File uploaded to Supabase:', uploadData.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);
    
    console.log('✅ Public URL generated:', urlData.publicUrl);
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: fileName,
        size: fileBuffer.length,
        type: fileType,
      },
      upload: {
        path: uniqueFileName,
        bucket: bucket,
        folder: folder,
      },
      url: urlData.publicUrl,
      publicUrl: urlData.publicUrl, // Alias for compatibility
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('❌ Test upload error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error.message || 'Unknown error'),
        details: error.stack
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test Upload API',
    usage: {
      method: 'POST',
      endpoint: '/api/test-upload',
      description: 'Upload a file to Supabase Storage for testing',
      body: 'multipart/form-data',
      fields: {
        file: 'File to upload (required)',
        fileType: 'MIME type (optional, e.g., image/jpeg, application/pdf)',
      },
      example: 'curl -X POST -F "file=@test.pdf" -F "fileType=application/pdf" https://admin-orcin-omega.vercel.app/api/test-upload',
    },
    buckets: {
      images: 'books/covers',
      pdfs: 'books/pdfs',
    },
  });
}
