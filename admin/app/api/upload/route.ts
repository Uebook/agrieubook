import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import Busboy from 'busboy';

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

// POST /api/upload - Handles both file uploads and URL generation
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    console.log('📥 Upload API called:', {
      contentType,
      method: request.method,
      url: request.url,
      hasContentType: !!contentType,
    });
    
    // Try to detect if this is a file upload or URL generation request
    // React Native FormData might not include "multipart/form-data" in the header
    // So we try to parse as formData first, and if it fails, try as JSON
    try {
      // Try to get formData - if it works, it's a file upload
      const formData = await request.formData();
      const file = formData.get('file');
      
      console.log('📦 FormData parsed:', {
        hasFile: !!file,
        fileType: typeof file,
        fileIsNull: file === null,
        fileIsUndefined: file === undefined,
        formDataKeys: Array.from(formData.keys()),
        allFormDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          valueType: typeof value,
          valueIsFile: value instanceof File,
          valueIsBlob: value instanceof Blob,
          valueConstructor: (value as any)?.constructor?.name,
        })),
      });
      
      if (file && file !== 'null' && file !== 'undefined') {
        // This is a file upload request - pass formData directly to avoid reading body twice
        console.log('📤 Processing file upload...');
        const result = await handleFileUpload(formData);
        
        // If handleFileUpload returned an error response, return it directly
        if (result instanceof NextResponse) {
          console.error('❌ File upload returned error response');
          // Add CORS headers to error response
          Object.entries(getCorsHeaders()).forEach(([key, value]) => {
            result.headers.set(key, value);
          });
          return result;
        }
        
        // Ensure result has the expected structure
        if (!result || typeof result !== 'object') {
          console.error('❌ Invalid upload result:', result);
          const errorResponse = NextResponse.json(
            { error: 'Invalid upload response from server' },
            { status: 500 }
          );
          Object.entries(getCorsHeaders()).forEach(([key, value]) => {
            errorResponse.headers.set(key, value);
          });
          return errorResponse;
        }
        
        // Ensure url is present
        if (!result.url) {
          console.error('❌ Upload result missing URL:', result);
          const errorResponse = NextResponse.json(
            { error: 'Upload succeeded but no URL returned', details: result },
            { status: 500 }
          );
          Object.entries(getCorsHeaders()).forEach(([key, value]) => {
            errorResponse.headers.set(key, value);
          });
          return errorResponse;
        }
        
        console.log('✅ File upload successful, returning response');
        // Add CORS headers to success response
        const response = NextResponse.json(result);
        Object.entries(getCorsHeaders()).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      } else {
        console.warn('⚠️ No file found in FormData, trying URL generation...');
        // No file found, might be URL generation with formData (unlikely but handle it)
        return handleUrlGeneration(request);
      }
    } catch (formDataError: any) {
      console.error('❌ FormData parsing error:', formDataError);
      console.error('Error details:', {
        message: formDataError.message,
        stack: formDataError.stack,
        contentType,
        errorName: formDataError.name,
      });
      
      // If formData parsing fails but it's a multipart request, try busboy as fallback
      if (contentType.includes('multipart') || contentType.includes('form-data')) {
        console.log('🔄 Trying busboy as fallback for multipart form data...');
        try {
          const result = await handleFileUploadWithBusboy(request);
          if (result) {
            const response = NextResponse.json(result);
            Object.entries(getCorsHeaders()).forEach(([key, value]) => {
              response.headers.set(key, value);
            });
            return response;
          }
        } catch (busboyError: any) {
          console.error('❌ Busboy parsing also failed:', busboyError);
        }
        
        const errorResponse = NextResponse.json(
          { 
            error: 'Failed to parse file upload. Please ensure the file is being sent correctly.',
            details: formDataError.message 
          },
          { status: 400 }
        );
        Object.entries(getCorsHeaders()).forEach(([key, value]) => {
          errorResponse.headers.set(key, value);
        });
        return errorResponse;
      }
      return handleUrlGeneration(request);
    }
  } catch (error: any) {
    console.error('Error in POST /api/upload:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
    // Add CORS headers to error response
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    return errorResponse;
  }
}

// Handle file upload with busboy (fallback for React Native)
async function handleFileUploadWithBusboy(request: NextRequest) {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const supabase = createServerClient();
      const contentType = request.headers.get('content-type') || '';
      const busboy = Busboy({ headers: { 'content-type': contentType } });
      const fileChunks: Buffer[] = [];
      let fileBuffer: Buffer | null = null;
      let fileName = 'file';
      let fileType = 'application/octet-stream';
      let bucket = '';
      let folder = '';
      let authorId: string | null = null;
      let fileReceived = false;

      busboy.on('file', (name, file, info) => {
        console.log('📥 Busboy received file:', { name, filename: info.filename, encoding: info.encoding, mimeType: info.mimeType });
        fileReceived = true;
        fileName = info.filename || fileName;
        fileType = info.mimeType || fileType;
        
        file.on('data', (chunk: Buffer) => {
          fileChunks.push(chunk);
        });

        file.on('end', () => {
          fileBuffer = Buffer.concat(fileChunks);
          console.log('✅ Busboy file read complete:', { size: fileBuffer.length, fileName, fileType });
        });
      });

      busboy.on('field', (name, value) => {
        console.log('📝 Busboy field:', { name, value });
        if (name === 'bucket') bucket = value;
        else if (name === 'folder') folder = value;
        else if (name === 'fileName') fileName = value;
        else if (name === 'fileType') fileType = value;
        else if (name === 'author_id') authorId = value;
      });

      busboy.on('finish', async () => {
        try {
          if (!fileReceived || !fileBuffer || !bucket) {
            reject(new Error(`Missing file or bucket. fileReceived: ${fileReceived}, hasBuffer: ${!!fileBuffer}, bucket: ${bucket}`));
            return;
          }

          // Generate unique file name
          const timestamp = Date.now();
          let uniqueFileName: string;
          if (folder && authorId) {
            uniqueFileName = `${folder}/${authorId}/${timestamp}-${fileName}`;
          } else if (folder) {
            uniqueFileName = `${folder}/${timestamp}-${fileName}`;
          } else if (authorId) {
            uniqueFileName = `${authorId}/${timestamp}-${fileName}`;
          } else {
            uniqueFileName = `${timestamp}-${fileName}`;
          }

          // Upload to Supabase
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(uniqueFileName, fileBuffer, {
              contentType: fileType,
              cacheControl: '3600',
              upsert: false,
            });

          if (error) {
            console.error('Supabase upload error:', error);
            reject(error);
            return;
          }

          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(uniqueFileName);

          const { data: signedUrlData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(uniqueFileName, 31536000); // 1 year

          resolve({
            success: true,
            url: urlData.publicUrl,
            path: uniqueFileName,
            publicUrl: urlData.publicUrl,
            signedUrl: signedUrlData?.signedUrl || urlData.publicUrl,
          });
        } catch (error: any) {
          reject(error);
        }
      });

      busboy.on('error', (error: Error) => {
        console.error('Busboy error:', error);
        reject(error);
      });

      // Get request body as array buffer and pipe to busboy
      const arrayBuffer = await request.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      busboy.write(buffer);
      busboy.end();
    } catch (error: any) {
      reject(error);
    }
  });
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
        hasText: typeof fileObj?.text === 'function',
        keys: fileObj ? Object.keys(fileObj) : [],
        size: (fileObj as any)?.size,
        name: (fileObj as any)?.name,
        type: (fileObj as any)?.type,
      });
      
      // Method 1: File object (web) - This should work for React Native too
      if (fileObj instanceof File) {
        console.log('Reading as File object');
        try {
          const arrayBuffer = await fileObj.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          finalFileName = fileObj.name || fileName;
          contentType = fileObj.type || fileType;
          console.log('✅ File read successfully:', { 
            size: fileBuffer.length, 
            finalFileName, 
            contentType,
            originalSize: fileObj.size,
            originalName: fileObj.name,
            originalType: fileObj.type,
          });
        } catch (fileReadError: any) {
          console.error('❌ Error reading File object:', fileReadError);
          throw new Error(`Failed to read File object: ${fileReadError.message}`);
        }
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
      // Method 7: React Native FormData - file might be sent as a special object
      // Check if it's a File-like object from React Native
      else if (fileObj && typeof fileObj === 'object' && !Array.isArray(fileObj)) {
        console.log('Trying React Native file format...');
        let bufferFound = false;
        
        // React Native FormData sends files that Next.js receives as File objects
        // But sometimes they might be wrapped or have special properties
        try {
          // Try: Check if it has a _data or data property (some FormData implementations)
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
            } else if (typeof dataProp === 'string') {
              // Might be base64 encoded
              if (dataProp.startsWith('data:')) {
                const base64Data = dataProp.split(',')[1];
                fileBuffer = Buffer.from(base64Data, 'base64');
                finalFileName = fileName;
                contentType = fileType;
                bufferFound = true;
                console.log('✅ File read from _data/data as base64:', { size: fileBuffer.length });
              }
            }
          }
          
          // Try: Check if it has a stream method (Node.js stream)
          if (!bufferFound && typeof (fileObj as any).stream === 'function') {
            console.log('Trying to read as stream...');
            const stream = (fileObj as any).stream();
            const chunks: Uint8Array[] = [];
            const reader = stream.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) chunks.push(value);
              }
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
              bufferFound = true;
              console.log('✅ File read from stream:', { size: fileBuffer.length });
            } finally {
              reader.releaseLock();
            }
          }
          
          // Try: Convert to Blob and read
          if (!bufferFound) {
            try {
              const blob = new Blob([fileObj as any]);
              const arrayBuffer = await blob.arrayBuffer();
              fileBuffer = Buffer.from(arrayBuffer);
              finalFileName = fileName;
              contentType = fileType;
              bufferFound = true;
              console.log('✅ File read via Blob conversion:', { size: fileBuffer.length, finalFileName, contentType });
            } catch (blobError: any) {
              console.log('Blob conversion failed:', blobError.message);
            }
          }
          
          // Last resort: Check if it's a string (base64)
          if (!bufferFound && typeof fileObj === 'string') {
            if (fileObj.startsWith('data:')) {
              const base64Data = fileObj.split(',')[1];
              fileBuffer = Buffer.from(base64Data, 'base64');
              finalFileName = fileName;
              contentType = fileType;
              bufferFound = true;
              console.log('✅ File read as base64 string:', { size: fileBuffer.length });
            }
          }
          
          if (!bufferFound) {
            // Final error with all details
            console.error('❌ All file reading methods failed for React Native file');
            console.error('File object type:', typeof fileObj);
            console.error('File object constructor:', fileObj?.constructor?.name);
            console.error('File object prototype:', Object.getPrototypeOf(fileObj)?.constructor?.name);
            console.error('File object keys:', fileObj ? Object.keys(fileObj) : 'null');
            console.error('File object values (first 3):', fileObj ? Object.values(fileObj).slice(0, 3) : 'null');
            
            throw new Error(
              `Cannot read file from React Native. Type: ${typeof fileObj}, Constructor: ${fileObj?.constructor?.name || 'unknown'}, ` +
              `Prototype: ${Object.getPrototypeOf(fileObj)?.constructor?.name || 'unknown'}, ` +
              `Has arrayBuffer: ${typeof fileObj?.arrayBuffer === 'function'}, ` +
              `Has stream: ${typeof fileObj?.stream === 'function'}, ` +
              `Has text: ${typeof fileObj?.text === 'function'}, ` +
              `Keys: ${fileObj ? Object.keys(fileObj).join(', ') : 'none'}`
            );
          }
        } catch (rnError: any) {
          console.error('Error processing React Native file:', rnError);
          throw rnError;
        }
      }
      // Method 8: Final fallback - try converting to Blob
      else {
        console.log('Trying final Blob conversion...');
        try {
          const blob = new Blob([fileObj as any]);
          const arrayBuffer = await blob.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
          finalFileName = fileName;
          contentType = fileType;
          console.log('✅ File read via final Blob conversion:', { size: fileBuffer.length, finalFileName, contentType });
        } catch (blobError: any) {
          console.error('❌ Final Blob conversion failed');
          console.error('File object type:', typeof fileObj);
          console.error('File object constructor:', fileObj?.constructor?.name);
          console.error('File object keys:', fileObj ? Object.keys(fileObj) : 'null');
          
          throw new Error(
            `Cannot read file. Type: ${typeof fileObj}, Constructor: ${fileObj?.constructor?.name || 'unknown'}, ` +
            `Keys: ${fileObj ? Object.keys(fileObj).join(', ') : 'none'}`
          );
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
    
    // Ensure fileBuffer is defined before upload
    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'File buffer is undefined' },
        { status: 400 }
      );
    }
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, fileBuffer as Buffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Upload details:', {
        bucket,
        uniqueFileName,
        fileSize: fileBuffer.length,
        contentType,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload file';
      const errorAny = error as any;
      if (error.message) {
        errorMessage = error.message;
      } else if (errorAny.statusCode === 404 || errorAny.status === 404) {
        errorMessage = `Bucket "${bucket}" not found. Please create the bucket in Supabase Storage.`;
      } else if (errorAny.statusCode === 403 || errorAny.status === 403) {
        errorMessage = `Permission denied for bucket "${bucket}". Please check bucket permissions.`;
      } else if (errorAny.statusCode === 413 || errorAny.status === 413) {
        errorMessage = 'File too large. Please reduce the file size.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
    
    // Try to get public URL first
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);
    
    // Also generate a signed URL as fallback (valid for 1 year)
    // This works even if bucket is private
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(uniqueFileName, 31536000); // 1 year expiry
    
    // Use signed URL if available, otherwise use public URL
    // Note: If bucket is private, public URL won't work, so signed URL is better
    const finalUrl = signedUrlData?.signedUrl || urlData.publicUrl;
    
    if (!finalUrl) {
      console.error('Failed to generate URL:', { signedUrlError, publicUrl: urlData.publicUrl });
      return NextResponse.json(
        { 
          error: 'Failed to generate file URL. Please ensure the bucket exists and is accessible.',
          details: signedUrlError?.message || 'No URL generated'
        },
        { status: 500 }
      );
    }
    
    // Return in the exact format expected by the mobile app
    // { success: true, path: ..., url: ... }
    const responseData = {
      success: true,
      path: uniqueFileName,
      url: finalUrl,
      publicUrl: urlData.publicUrl, // Include public URL even if we use signed
      signedUrl: signedUrlData?.signedUrl, // Include signed URL
    };
    
    console.log('✅ Upload successful, returning:', {
      success: responseData.success,
      path: responseData.path,
      url: responseData.url ? responseData.url.substring(0, 50) + '...' : null,
      hasPublicUrl: !!responseData.publicUrl,
      hasSignedUrl: !!responseData.signedUrl,
    });
    
    return responseData;
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




