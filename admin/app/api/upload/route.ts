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
        // This is a file upload request - pass formData directly to avoid reading body twice
        return handleFileUpload(formData);
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
async function handleFileUpload(formData: FormData) {
  try {
    const supabase = createServerClient();
    const file = formData.get('file');
    const bucket = formData.get('bucket') as string;
    const folder = formData.get('folder') as string;
    const fileName = (formData.get('fileName') as string) || 'file';
    const fileType = (formData.get('fileType') as string) || 'application/octet-stream';
    const authorId = formData.get('author_id') as string | null; // Get author_id from formData
    
    // Enhanced debug logging
    console.log('📥 Upload request received:', {
      hasFile: !!file,
      fileTypeOf: typeof file,
      fileConstructor: file?.constructor?.name,
      fileIsNull: file === null,
      fileIsUndefined: file === undefined,
      bucket,
      folder,
      fileName,
      mimeType: fileType,
      authorId,
    });
    
    // Log file object structure in detail
    if (file) {
      const fileAny = file as any;
      console.log('📄 File object details:', {
        objectType: typeof fileAny,
        constructor: fileAny?.constructor?.name,
        prototype: Object.getPrototypeOf(fileAny)?.constructor?.name,
        isFile: fileAny instanceof File,
        isBlob: fileAny instanceof Blob,
        keys: Object.keys(fileAny),
        hasArrayBuffer: typeof fileAny?.arrayBuffer === 'function',
        hasStream: typeof fileAny?.stream === 'function',
        hasText: typeof fileAny?.text === 'function',
        size: fileAny?.size,
        name: fileAny?.name,
        mimeType: fileAny?.type,
        // Check for React Native specific properties
        uri: fileAny?.uri,
        path: fileAny?.path,
      });
    }
    
    if (!file || !bucket) {
      return NextResponse.json(
        { 
          error: 'Missing file or bucket', 
          details: { 
            hasFile: !!file, 
            bucket,
            fileType: typeof file,
            fileConstructor: file?.constructor?.name,
          } 
        },
        { status: 400 }
      );
    }
    
    // Read file as Buffer (works for both File and React Native FormData)
    let fileBuffer: Buffer | undefined;
    let finalFileName: string = fileName; // Initialize with fileName from formData
    let contentType: string = fileType; // Initialize with fileType from formData
    
    try {
      const fileObj = file as any;
      
      console.log('Processing file:', {
        isFile: fileObj instanceof File,
        isBlob: fileObj instanceof Blob,
        type: typeof fileObj,
        constructor: fileObj?.constructor?.name,
        hasArrayBuffer: typeof fileObj?.arrayBuffer === 'function',
        hasStream: typeof fileObj?.stream === 'function',
        keys: fileObj ? Object.keys(fileObj) : [],
      });
      
      // Method 1: File object (web)
      if (fileObj instanceof File) {
        console.log('Reading as File object');
        const arrayBuffer = await fileObj.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        finalFileName = fileObj.name || fileName;
        contentType = fileObj.type || fileType;
        console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
      }
      // Method 2: Blob object
      else if (fileObj instanceof Blob) {
        console.log('Reading as Blob object');
        const arrayBuffer = await fileObj.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        finalFileName = fileName;
        contentType = fileObj.type || fileType;
        console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
      }
      // Method 3: Has arrayBuffer method
      else if (typeof fileObj?.arrayBuffer === 'function') {
        console.log('Reading via arrayBuffer() method');
        const arrayBuffer = await fileObj.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        finalFileName = fileName;
        contentType = fileType;
        console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
      }
      // Method 4: ReadableStream
      else if (fileObj && typeof fileObj.stream === 'function') {
        console.log('Reading as ReadableStream');
        const stream = fileObj.stream();
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
          fileBuffer = Buffer.from(combined.buffer);
          finalFileName = fileName;
          contentType = fileType;
          console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
        } finally {
          reader.releaseLock();
        }
      }
      // Method 5: Try as Buffer directly (Node.js)
      else if (Buffer.isBuffer(fileObj)) {
        console.log('Reading as Buffer');
        fileBuffer = fileObj;
        finalFileName = fileName;
        contentType = fileType;
        console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
      }
      // Method 6: Try as Uint8Array or Array-like
      else if (fileObj instanceof Uint8Array || Array.isArray(fileObj)) {
        console.log('Reading as Uint8Array or Array');
        fileBuffer = Buffer.from(fileObj);
        finalFileName = fileName;
        contentType = fileType;
        console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
      }
      // Method 7: Try converting to Blob
      else {
        console.log('Trying Blob conversion...');
        let bufferFound = false;
        try {
          // React Native FormData may send as object with uri/path
          // In Next.js, FormData.get() should return a File or Blob
          // If it's an object, try to create a Blob from it
          const blob = new Blob([fileObj]);
          const arrayBuffer = await blob.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          finalFileName = fileName;
          contentType = fileType;
          bufferFound = true;
          console.log('✅ File read via Blob conversion:', { size: fileBuffer.length, finalFileName, contentType });
        } catch (blobError: any) {
          console.error('❌ Blob conversion failed, trying alternative methods...');
          console.error('Blob conversion error:', blobError.message);
          
          // Try: Check if it has a _data or data property (some FormData implementations)
          if (fileObj && typeof fileObj === 'object') {
            const dataProp = (fileObj as any)._data || (fileObj as any).data;
            if (dataProp) {
              console.log('Found _data or data property, trying to read...');
              if (Buffer.isBuffer(dataProp)) {
                fileBuffer = dataProp;
                finalFileName = fileName;
                contentType = fileType;
                bufferFound = true;
                console.log('✅ File read from _data/data property:', { size: fileBuffer.length });
              } else if (dataProp instanceof Uint8Array) {
                fileBuffer = Buffer.from(dataProp);
                finalFileName = fileName;
                contentType = fileType;
                bufferFound = true;
                console.log('✅ File read from _data/data as Uint8Array:', { size: fileBuffer.length });
              }
            }
          }
          
          // If still no buffer, try last resort methods
          if (!bufferFound) {
            // Last resort: Check if it's a string (base64)
            if (typeof fileObj === 'string') {
              if (fileObj.startsWith('data:')) {
                const base64Data = fileObj.split(',')[1];
                fileBuffer = Buffer.from(base64Data, 'base64');
                finalFileName = fileName;
                contentType = fileType;
                bufferFound = true;
                console.log('✅ File read as base64 string:', { size: fileBuffer.length });
              } else {
                throw new Error('File is a string but not base64 format');
              }
            } else {
              // Final error with all details
              console.error('❌ All file reading methods failed');
              console.error('File object type:', typeof fileObj);
              console.error('File object constructor:', fileObj?.constructor?.name);
              console.error('File object prototype:', Object.getPrototypeOf(fileObj)?.constructor?.name);
              console.error('File object keys:', fileObj ? Object.keys(fileObj) : 'null');
              console.error('File object values:', fileObj ? Object.values(fileObj).slice(0, 3) : 'null');
              
              throw new Error(
                `Cannot read file. Type: ${typeof fileObj}, Constructor: ${fileObj?.constructor?.name || 'unknown'}, ` +
                `Prototype: ${Object.getPrototypeOf(fileObj)?.constructor?.name || 'unknown'}, ` +
                `Has arrayBuffer: ${typeof fileObj?.arrayBuffer === 'function'}, ` +
                `Has stream: ${typeof fileObj?.stream === 'function'}, ` +
                `Has text: ${typeof fileObj?.text === 'function'}, ` +
                `Keys: ${fileObj ? Object.keys(fileObj).join(', ') : 'none'}`
              );
            }
          }
        }
      }
    } catch (readError: any) {
      console.error('Error reading file:', readError);
      console.error('File object details:', {
        type: typeof file,
        constructor: file?.constructor?.name,
        keys: file ? Object.keys(file) : [],
      });
      return NextResponse.json(
        { 
          error: 'Failed to read file: ' + (readError.message || 'Unknown error'),
          details: readError.stack || 'No stack trace',
          fileType: typeof file,
        },
        { status: 400 }
      );
    }
    
    // Generate unique file name with author_id if provided
    const timestamp = Date.now();
    const fileExt = finalFileName.split('.').pop() || 'bin';
    // Include author_id in path if provided: folder/author_id/timestamp-filename
    let uniqueFileName: string;
    if (folder && authorId) {
      uniqueFileName = `${folder}/${authorId}/${timestamp}-${finalFileName}`;
    } else if (folder) {
      uniqueFileName = `${folder}/${timestamp}-${finalFileName}`;
    } else if (authorId) {
      uniqueFileName = `${authorId}/${timestamp}-${finalFileName}`;
    } else {
      uniqueFileName = `${timestamp}-${finalFileName}`;
    }
    
    // Upload to Supabase Storage
    // TypeScript assertion: fileBuffer is guaranteed to be defined at this point
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, fileBuffer as Buffer, {
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
        { 
          error: 'Failed to create upload URL',
          details: uploadError.message || 'Unknown error'
        },
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
      { 
        error: 'Internal server error',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}




