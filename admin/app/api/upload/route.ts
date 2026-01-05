import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST /api/upload - Handles both file uploads and URL generation
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Try to detect if this is a file upload or URL generation request
    // React Native FormData might not include "multipart/form-data" in the header
    // So we try to parse as formData first, and if it fails, try as JSON
    try {
      // Try to get formData - if it works, it's a file upload
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (file) {
        // This is a file upload request
        return handleFileUpload(request);
      } else {
        // No file found, might be URL generation with formData (unlikely but handle it)
        return handleUrlGeneration(request);
      }
    } catch (formDataError) {
      // If formData parsing fails, try as JSON (URL generation request)
      return handleUrlGeneration(request);
    }
  } catch (error: any) {
    console.error('Error in POST /api/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// Handle file upload
async function handleFileUpload(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') as string;
    const folder = formData.get('folder') as string;
    const fileName = (formData.get('fileName') as string) || 'file';
    const fileType = (formData.get('fileType') as string) || 'application/octet-stream';
    
    if (!file || !bucket) {
      return NextResponse.json(
        { error: 'Missing file or bucket' },
        { status: 400 }
      );
    }
    
    // Read file as Buffer (works for both File and React Native FormData)
    let fileBuffer: Buffer;
    let finalFileName: string;
    let contentType: string;
    
    try {
      // Type guard for File (web)
      const fileObj = file as unknown;
      
      if (fileObj instanceof File) {
        // Web File object
        const arrayBuffer = await fileObj.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        finalFileName = fileObj.name || fileName;
        contentType = fileObj.type || fileType;
      } else {
        // For React Native or other sources, try multiple approaches
        let arrayBuffer: ArrayBuffer | null = null;
        
        // Try 1: Check if it has arrayBuffer method (Blob-like)
        const blobLike = fileObj as { arrayBuffer?: () => Promise<ArrayBuffer> };
        if (blobLike && typeof blobLike.arrayBuffer === 'function') {
          arrayBuffer = await blobLike.arrayBuffer();
        }
        // Try 2: Check if it's a Blob
        else if (fileObj instanceof Blob) {
          arrayBuffer = await fileObj.arrayBuffer();
        }
        // Try 3: Check if it's a ReadableStream
        else {
          const stream = fileObj as ReadableStream<Uint8Array>;
          if (stream && typeof stream.getReader === 'function') {
            const chunks: Uint8Array[] = [];
            const reader = stream.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) chunks.push(value);
              }
              // Convert chunks to single buffer
              const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
              }
              arrayBuffer = combined.buffer;
            } finally {
              reader.releaseLock();
            }
          }
        }
        
        if (arrayBuffer) {
          fileBuffer = Buffer.from(arrayBuffer);
          finalFileName = fileName;
          contentType = fileType;
        } else {
          // Last resort: try as string (base64 or plain)
          const fileString = fileObj as string;
          if (typeof fileString === 'string') {
            if (fileString.startsWith('data:')) {
              const base64Data = fileString.split(',')[1];
              fileBuffer = Buffer.from(base64Data, 'base64');
            } else {
              fileBuffer = Buffer.from(fileString, 'utf-8');
            }
            finalFileName = fileName;
            contentType = fileType;
          } else {
            throw new Error(`Unsupported file type. Got: ${typeof fileObj}`);
          }
        }
      }
    } catch (readError: any) {
      console.error('Error reading file:', readError);
      return NextResponse.json(
        { error: 'Failed to read file: ' + (readError.message || 'Unknown error') },
        { status: 400 }
      );
    }
    
    // Generate unique file name
    const timestamp = Date.now();
    const fileExt = finalFileName.split('.').pop() || 'bin';
    const uniqueFileName = folder
      ? `${folder}/${timestamp}-${finalFileName}`
      : `${timestamp}-${finalFileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, fileBuffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file: ' + error.message },
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
  } catch (error: any) {
    console.error('Error in file upload:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// Handle URL generation
async function handleUrlGeneration(request: NextRequest) {
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
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    });
  } catch (error: any) {
    console.error('Error in URL generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




