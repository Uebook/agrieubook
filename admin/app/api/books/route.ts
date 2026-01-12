import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { notifyCustomersAboutNewBook } from '@/lib/utils/notifications';

// Increase function timeout for file uploads (max 60s on Pro plan, 10s on Hobby)
export const maxDuration = 60;

// Helper function to upload file to Supabase Storage (handles React Native files)
// Uses the same robust file handling as /api/upload
async function uploadFileToStorage(
  supabase: any,
  file: File | Blob | any,
  bucket: string,
  folder: string,
  authorId: string | null,
  fileName?: string,
  fileType?: string
): Promise<string> {
  // Read file as Buffer (handle React Native format)
  let fileBuffer: Buffer | undefined;
  let finalFileName: string = fileName || 'file';
  let contentType: string = fileType || 'application/octet-stream';
  
  try {
    const fileObj = file as any;
    
    console.log('📄 Processing file for upload:', {
      isFile: fileObj instanceof File,
      isBlob: fileObj instanceof Blob,
      objectType: typeof fileObj,
      constructor: fileObj?.constructor?.name,
      hasArrayBuffer: typeof fileObj?.arrayBuffer === 'function',
      hasStream: typeof fileObj?.stream === 'function',
      keys: fileObj ? Object.keys(fileObj) : [],
      size: (fileObj as any)?.size,
      name: (fileObj as any)?.name,
      mimeType: (fileObj as any)?.type,
    });
    
    // Method 1: File object (web) - This should work for React Native too
    if (fileObj instanceof File) {
      console.log('Reading as File object');
      try {
        const arrayBuffer = await fileObj.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        finalFileName = fileObj.name || fileName || 'file';
        contentType = fileObj.type || fileType || 'application/octet-stream';
        console.log('✅ File read successfully:', { 
          size: fileBuffer.length, 
          finalFileName, 
          contentType,
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
      finalFileName = fileName || 'file';
      contentType = fileObj.type || fileType || 'application/octet-stream';
      console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
    }
    // Method 3: Has arrayBuffer method
    else if (typeof fileObj?.arrayBuffer === 'function') {
      console.log('Reading via arrayBuffer() method');
      const arrayBuffer = await fileObj.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      finalFileName = fileName || 'file';
      contentType = fileType || 'application/octet-stream';
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
        finalFileName = fileName || 'file';
        contentType = fileType || 'application/octet-stream';
        console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
      } finally {
        reader.releaseLock();
      }
    }
    // Method 5: Try as Buffer directly (Node.js)
    else if (Buffer.isBuffer(fileObj)) {
      console.log('Reading as Buffer');
      fileBuffer = fileObj;
      finalFileName = fileName || 'file';
      contentType = fileType || 'application/octet-stream';
      console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
    }
    // Method 6: Try as Uint8Array or Array-like
    else if (fileObj instanceof Uint8Array || Array.isArray(fileObj)) {
      console.log('Reading as Uint8Array or Array');
      fileBuffer = Buffer.from(fileObj);
      finalFileName = fileName || 'file';
      contentType = fileType || 'application/octet-stream';
      console.log('✅ File read successfully:', { size: fileBuffer.length, finalFileName, contentType });
    }
    // Method 7: React Native FormData - file might be sent as a special object
    else if (fileObj && typeof fileObj === 'object' && !Array.isArray(fileObj)) {
      console.log('Trying React Native file format...');
      let bufferFound = false;
      
      // Try: Check if it has a _data or data property
      const dataProp = (fileObj as any)._data || (fileObj as any).data;
      if (dataProp) {
        console.log('Found _data or data property, trying to read...');
        if (Buffer.isBuffer(dataProp)) {
          fileBuffer = dataProp;
          finalFileName = fileName || 'file';
          contentType = fileType || 'application/octet-stream';
          bufferFound = true;
          console.log('✅ File read from _data/data property:', { size: fileBuffer.length });
        } else if (dataProp instanceof Uint8Array) {
          fileBuffer = Buffer.from(dataProp);
          finalFileName = fileName || 'file';
          contentType = fileType || 'application/octet-stream';
          bufferFound = true;
          console.log('✅ File read from _data/data as Uint8Array:', { size: fileBuffer.length });
        } else if (typeof dataProp === 'string') {
          // Might be base64 encoded
          if (dataProp.startsWith('data:')) {
            const base64Data = dataProp.split(',')[1];
            fileBuffer = Buffer.from(base64Data, 'base64');
            finalFileName = fileName || 'file';
            contentType = fileType || 'application/octet-stream';
            bufferFound = true;
            console.log('✅ File read from _data/data as base64:', { size: fileBuffer.length });
          }
        }
      }
      
      if (!bufferFound) {
        console.error('❌ Unsupported React Native file format:', {
          type: typeof fileObj,
          constructor: fileObj?.constructor?.name,
          keys: Object.keys(fileObj),
        });
        throw new Error('Unsupported file format: Could not read React Native file object');
      }
    }
    // Method 8: Fallback - unsupported format
    else {
      console.error('❌ Unsupported file format:', {
        type: typeof fileObj,
        constructor: fileObj?.constructor?.name,
        keys: fileObj ? Object.keys(fileObj) : [],
      });
      throw new Error('Unsupported file format');
    }
    
    if (!fileBuffer) {
      throw new Error('Failed to read file: No buffer created');
    }
  } catch (readError: any) {
    console.error('❌ Error reading file:', readError);
    throw new Error(`Failed to read file: ${readError.message}`);
  }
  
  // Generate unique file name with author_id if provided
  const timestamp = Date.now();
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
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqueFileName, fileBuffer, {
      contentType: contentType,
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(uniqueFileName);
  
  // Also generate signed URL as fallback
  const { data: signedUrlData } = await supabase.storage
    .from(bucket)
    .createSignedUrl(uniqueFileName, 31536000); // 1 year expiry
  
  // Use signed URL if available, otherwise use public URL
  return signedUrlData?.signedUrl || urlData.publicUrl;
}

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

// GET /api/books - List books with pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const categoryId = searchParams.get('category');
    const authorId = searchParams.get('authorId') || searchParams.get('author'); // Support both parameter names
    const language = searchParams.get('language');
    const search = searchParams.get('search');
    // Default to 'published' for security - only show published books unless explicitly requested
    // Admin panel can pass status='all' to see all books
    const status = searchParams.get('status') || 'published';

    console.log('📚 GET /api/books - Filters:', {
      categoryId,
      authorId,
      language,
      search,
      status,
      page,
      limit,
      categoryIdType: typeof categoryId,
      categoryIdValue: categoryId,
    });

    // Build query
    let query = supabase
      .from('books')
      .select(`
        *,
        author:authors(*),
        category:categories(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter only if specified (not 'all')
    if (status && status !== 'all') {
      query = query.eq('status', status);
      console.log('📚 Applied status filter:', status);
    }

    // Apply filters
    if (categoryId) {
      // Ensure categoryId is treated as a string for UUID comparison
      const categoryIdStr = String(categoryId).trim();
      query = query.eq('category_id', categoryIdStr);
      console.log('📚 Applied category filter:', {
        original: categoryId,
        processed: categoryIdStr,
        type: typeof categoryIdStr,
      });
    }

    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    if (language) {
      query = query.eq('language', language);
    }

    if (search) {
      // Full-text search
      query = query.textSearch('title', search, {
        type: 'websearch',
        config: 'english',
      });
    }

    const { data: books, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching books:', error);
      return NextResponse.json(
        { error: 'Failed to fetch books', details: error.message },
        { status: 500 }
      );
    }

    console.log('📚 GET /api/books - Results:', {
      booksCount: books?.length || 0,
      hasError: !!error,
    });

    // Get total count for pagination (apply same filters)
    let countQuery = supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
      console.log('📚 Count query: Applied status filter:', status);
    }

    // Apply same filters as main query
    if (categoryId) {
      // Ensure categoryId is treated as a string for UUID comparison
      const categoryIdStr = String(categoryId).trim();
      countQuery = countQuery.eq('category_id', categoryIdStr);
      console.log('📚 Count query: Applied category filter:', {
        original: categoryId,
        processed: categoryIdStr,
        type: typeof categoryIdStr,
      });
    }

    if (authorId) {
      countQuery = countQuery.eq('author_id', authorId);
      console.log('📚 Count query: Applied author filter:', authorId);
    }

    if (language) {
      countQuery = countQuery.eq('language', language);
      console.log('📚 Count query: Applied language filter:', language);
    }

    if (search) {
      countQuery = countQuery.textSearch('title', search, {
        type: 'websearch',
        config: 'english',
      });
      console.log('📚 Count query: Applied search filter:', search);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('❌ Error getting count:', countError);
      console.error('Count error details:', {
        message: countError.message,
        details: countError.details,
        hint: countError.hint,
      });
    }

    console.log('📚 GET /api/books - Count result:', {
      totalCount,
      hasCountError: !!countError,
      categoryId,
      status,
    });

    const response = NextResponse.json({
      books: books || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
    // Add CORS headers
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('Error in GET /api/books:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    // Add CORS headers to error response
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    return errorResponse;
  }
}

// POST /api/books - Create new book (supports both FormData with files and JSON)
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📥 POST /api/books - Request received at:', new Date().toISOString());
  
  try {
    const supabase = createServerClient();
    const contentType = request.headers.get('content-type') || '';
    
    console.log('📥 Request headers:', {
      contentType,
      contentLength: request.headers.get('content-length'),
      userAgent: request.headers.get('user-agent')?.substring(0, 50),
      origin: request.headers.get('origin'),
    });
    
    // Check if request is FormData (multipart) or JSON
    const isFormData = contentType.includes('multipart') || contentType.includes('form-data');
    
    let bookData: any = {};
    let coverImageFile: File | null = null;
    let pdfFile: File | null = null;
    let coverImageUrl: string | null = null;
    let pdfUrl: string | null = null;

    if (isFormData) {
      // Handle FormData with files (single API call)
      console.log('📦 Book upload: FormData detected, processing files and metadata...');
      console.log('📦 Request details:', {
        contentType,
        method: request.method,
        url: request.url,
        hasContentType: !!contentType,
      });
      
      try {
        const formData = await request.formData();
        
        // Log all FormData keys
        const formDataKeys = Array.from(formData.keys());
        console.log('📦 FormData keys:', formDataKeys);
        
        // Extract files
        coverImageFile = formData.get('coverImage') as File | null;
        pdfFile = formData.get('pdfFile') as File | null;
        
        // Log file details
        if (coverImageFile) {
          const coverFileAny = coverImageFile as any;
          console.log('📸 Cover image file details:', {
            isFile: coverImageFile instanceof File,
            isBlob: coverImageFile instanceof Blob,
            typeOf: typeof coverImageFile,
            constructor: coverImageFile?.constructor?.name,
            name: coverFileAny?.name,
            size: coverFileAny?.size,
            mimeType: coverFileAny?.type,
            hasArrayBuffer: typeof coverFileAny?.arrayBuffer === 'function',
            keys: Object.keys(coverFileAny || {}),
          });
        }
        
        if (pdfFile) {
          const pdfFileAny = pdfFile as any;
          console.log('📄 PDF file details:', {
            isFile: pdfFile instanceof File,
            isBlob: pdfFile instanceof Blob,
            typeOf: typeof pdfFile,
            constructor: pdfFile?.constructor?.name,
            name: pdfFileAny?.name,
            size: pdfFileAny?.size,
            mimeType: pdfFileAny?.type,
            hasArrayBuffer: typeof pdfFileAny?.arrayBuffer === 'function',
            keys: Object.keys(pdfFileAny || {}),
          });
        }
        
        // Extract metadata from FormData
        bookData = {
          title: formData.get('title') as string,
          author_id: formData.get('author_id') as string,
          summary: formData.get('summary') as string,
          price: formData.get('price') ? parseFloat(formData.get('price') as string) : 0,
          original_price: formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null,
          pages: formData.get('pages') ? parseInt(formData.get('pages') as string) : null,
          language: (formData.get('language') as string) || 'English',
          category_id: formData.get('category_id') as string,
          isbn: formData.get('isbn') as string || null,
          is_free: formData.get('is_free') === 'true' || false,
          published_date: (formData.get('published_date') as string) || new Date().toISOString(),
          status: (formData.get('status') as string) || 'pending', // Allow admin to set status
        };
        
        console.log('📦 FormData extracted:', {
          hasCoverImage: !!coverImageFile,
          hasPdfFile: !!pdfFile,
          title: bookData.title,
          author_id: bookData.author_id,
          category_id: bookData.category_id,
        });
      } catch (formDataError: any) {
        console.error('❌ Error parsing FormData:', formDataError);
        const errorResponse = NextResponse.json(
          { 
            error: 'Failed to parse FormData', 
            details: formDataError.message 
          },
          { status: 400 }
        );
        Object.entries(getCorsHeaders()).forEach(([key, value]) => {
          errorResponse.headers.set(key, value);
        });
        return errorResponse;
      }
      
      // Upload cover image if provided (optional)
      if (coverImageFile && coverImageFile instanceof File) {
        try {
          console.log('📤 Uploading cover image...');
          const coverImageFileName = (coverImageFile as any)?.name || `cover_${Date.now()}.jpg`;
          const coverImageFileType = (coverImageFile as any)?.type || 'image/jpeg';
          const coverImageUrlResult = await uploadFileToStorage(
            supabase,
            coverImageFile,
            'books',
            'covers',
            bookData.author_id,
            coverImageFileName,
            coverImageFileType
          );
          coverImageUrl = coverImageUrlResult;
          console.log('✅ Cover image uploaded:', coverImageUrl);
        } catch (uploadError: any) {
          console.error('⚠️ Cover image upload failed (optional):', uploadError.message);
          // Continue without cover image
          coverImageUrl = null;
        }
      }
      
      // Upload PDF if provided (optional)
      if (pdfFile && pdfFile instanceof File) {
        try {
          console.log('📤 Uploading PDF...');
          const pdfFileName = (pdfFile as any)?.name || `book_${Date.now()}.pdf`;
          const pdfFileType = (pdfFile as any)?.type || 'application/pdf';
          const pdfUrlResult = await uploadFileToStorage(
            supabase,
            pdfFile,
            'books',
            'pdfs',
            bookData.author_id,
            pdfFileName,
            pdfFileType
          );
          pdfUrl = pdfUrlResult;
          console.log('✅ PDF uploaded:', pdfUrl);
        } catch (uploadError: any) {
          console.error('⚠️ PDF upload failed (optional):', uploadError.message);
          // Continue without PDF
          pdfUrl = null;
        }
      }
      
      // Add uploaded URLs to bookData
      bookData.cover_image_url = coverImageUrl;
      bookData.cover_images = coverImageUrl ? [coverImageUrl] : [];
      bookData.pdf_url = pdfUrl;
    } else {
      // Handle JSON request (backward compatible)
      const body = await request.json();

      const {
        title,
        author_id,
        summary,
        price,
        original_price,
        pages,
        language,
        category_id,
        isbn,
        is_free,
        pdf_url,
        cover_image_url,
        cover_images,
        published_date,
        status,
      } = body;
      
      bookData = {
        title,
        author_id,
        summary,
        price,
        original_price,
        pages,
        language,
        category_id,
        isbn,
        is_free,
        pdf_url,
        cover_image_url,
        cover_images,
        published_date,
        status: status || 'pending', // Allow admin to set status
      };
      
      // Use existing URLs if provided
      coverImageUrl = cover_image_url || null;
      pdfUrl = pdf_url || null;
    }

    // Extract values from bookData
    const {
      title,
      author_id,
      summary,
      price,
      original_price,
      pages,
      language,
      category_id,
      isbn,
      is_free,
      pdf_url: bookPdfUrl,
      cover_image_url: bookCoverImageUrl,
      cover_images,
      published_date,
      status: bookStatus,
    } = bookData;

    // Use uploaded URLs if available, otherwise use bookData URLs
    const finalCoverImageUrl = coverImageUrl || bookCoverImageUrl || null;
    const finalPdfUrl = pdfUrl || bookPdfUrl || null;

    // Log image data for debugging
    console.log('📸 Image data received:', {
      cover_image_url: finalCoverImageUrl ? `${finalCoverImageUrl.substring(0, 50)}...` : null,
      pdf_url: finalPdfUrl ? `${finalPdfUrl.substring(0, 50)}...` : null,
      cover_images_count: Array.isArray(cover_images) ? cover_images.length : (cover_images ? 1 : 0),
      cover_images_type: typeof cover_images,
      cover_images_is_array: Array.isArray(cover_images),
      cover_images_preview: Array.isArray(cover_images)
        ? cover_images.map((url: string) => url ? `${url.substring(0, 30)}...` : null).slice(0, 3)
        : cover_images ? `${String(cover_images).substring(0, 30)}...` : null,
    });

    // Validate required fields
    if (!title || !author_id || !category_id) {
      const errorResponse = NextResponse.json(
        { error: 'Missing required fields: title, author_id, and category_id are required' },
        { status: 400 }
      );
      // Add CORS headers to error response
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    // Check if author exists, if not create one from user data
    let finalAuthorId = author_id;
    const { data: existingAuthor, error: authorCheckError } = await supabase
      .from('authors')
      .select('id')
      .eq('id', author_id)
      .single();

    if (authorCheckError || !existingAuthor) {
      console.log('Author not found, attempting to create from user data...');
      // Author doesn't exist, try to create from user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, mobile, avatar_url')
        .eq('id', author_id)
        .single();

      if (userData && !userError) {
        // Create author record from user data
        const { data: newAuthor, error: createAuthorError } = await supabase
          .from('authors')
          .insert({
            id: userData.id, // Use same ID as user
            name: userData.name || 'Unknown Author',
            email: userData.email || null,
            mobile: userData.mobile || null,
            avatar_url: userData.avatar_url || null,
            status: 'active',
          })
          .select()
          .single();

        if (createAuthorError) {
          console.error('Error creating author:', createAuthorError);
          // If it's a duplicate key error, author might have been created by another request
          // Check again if author exists now
          const { data: retryAuthor } = await supabase
            .from('authors')
            .select('id')
            .eq('id', author_id)
            .single();

          if (!retryAuthor) {
            const errorResponse = NextResponse.json(
              { error: `Failed to create author record: ${createAuthorError.message}` },
              { status: 400 }
            );
            Object.entries(getCorsHeaders()).forEach(([key, value]) => {
              errorResponse.headers.set(key, value);
            });
            return errorResponse;
          }
        } else {
          finalAuthorId = newAuthor.id;
        }
      } else {
        const errorResponse = NextResponse.json(
          { error: `Author ID ${author_id} not found in users table. Please ensure the user exists.` },
          { status: 400 }
        );
        Object.entries(getCorsHeaders()).forEach(([key, value]) => {
          errorResponse.headers.set(key, value);
        });
        return errorResponse;
      }
    }

    // Validate category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', category_id)
      .single();

    if (!category || categoryError) {
      console.error('Category validation error:', categoryError);
      const errorResponse = NextResponse.json(
        {
          error: `Invalid category_id: Category with ID ${category_id} does not exist. Please select a valid category.`,
          details: categoryError?.message || 'Category not found'
        },
        { status: 400 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    console.log('Category validated:', category.name);

    // Process cover_images - ensure it's an array
    let processedCoverImages: string[] = [];
    if (cover_images) {
      if (Array.isArray(cover_images)) {
        // Filter out null/undefined/empty strings
        processedCoverImages = cover_images.filter((url: any) => url && typeof url === 'string' && url.trim().length > 0);
      } else if (typeof cover_images === 'string' && cover_images.trim().length > 0) {
        // Single string, convert to array
        processedCoverImages = [cover_images];
      }
    }
    
    // If we have a finalCoverImageUrl, add it to the array if not already present
    if (finalCoverImageUrl && !processedCoverImages.includes(finalCoverImageUrl)) {
      processedCoverImages = [finalCoverImageUrl, ...processedCoverImages];
    }

    // Use uploaded/provided cover image URL, or first from array, or null
    const finalCoverImageUrlForDb = finalCoverImageUrl || (processedCoverImages.length > 0 ? processedCoverImages[0] : null);

    console.log('📸 Processed image data:', {
      cover_image_url: finalCoverImageUrlForDb ? `${finalCoverImageUrlForDb.substring(0, 50)}...` : null,
      pdf_url: finalPdfUrl ? `${finalPdfUrl.substring(0, 50)}...` : null,
      cover_images_count: processedCoverImages.length,
      cover_images_preview: processedCoverImages.slice(0, 3).map((url: string) => url ? `${url.substring(0, 30)}...` : null),
    });

    // Determine initial status - if admin is uploading, it might be published directly
    const initialStatus = bookStatus || 'pending';

    // Insert book (PDF is optional - can be null)
    const { data: book, error } = await supabase
      .from('books')
      .insert({
        title,
        author_id: finalAuthorId,
        summary,
        price: price || 0,
        original_price: original_price || price || 0,
        pages,
        language: language || 'English',
        category_id,
        isbn,
        is_free: is_free || false,
        pdf_url: finalPdfUrl, // Optional - can be null
        cover_image_url: finalCoverImageUrlForDb, // Optional - can be null
        cover_images: processedCoverImages, // Optional - can be empty array
        published_date: published_date || new Date().toISOString(),
        status: initialStatus,
      })
      .select(`
        *,
        author:authors(*)
      `)
      .single();

    if (error) {
      console.error('Error creating book:', error);
      // Provide more detailed error message
      let errorMessage = 'Failed to create book';
      if (error.code === '23503') {
        errorMessage = 'Foreign key constraint failed. Please ensure author and category exist.';
      } else if (error.code === '23505') {
        errorMessage = 'Duplicate entry. A book with this title or ISBN may already exist.';
      } else if (error.message) {
        errorMessage = `Failed to create book: ${error.message}`;
      }
      const errorResponse = NextResponse.json(
        { error: errorMessage, details: error },
        { status: 500 }
      );
      Object.entries(getCorsHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    // Log successful creation with image info
    console.log('✅ Book created successfully:', {
      book_id: book?.id,
      title: book?.title,
      has_cover_image_url: !!book?.cover_image_url,
      cover_images_count: Array.isArray(book?.cover_images) ? book.cover_images.length : 0,
      cover_image_url_preview: book?.cover_image_url ? `${book.cover_image_url.substring(0, 50)}...` : null,
    });

    // Update author's books count (ignore errors if RPC doesn't exist)
    try {
      await supabase.rpc('increment_author_books', {
        author_id_param: finalAuthorId,
      });
    } catch (rpcError) {
      console.warn('Could not increment author books count:', rpcError);
      // Not critical, continue
    }

    // Send notifications if book is published directly (admin upload)
    if (initialStatus === 'published' && book) {
      const authorName = (book.author as any)?.name || 'Unknown Author';
      const bookTitle = book.title;
      
      // Notify all customers about new book
      notifyCustomersAboutNewBook(bookTitle, authorName, book.id).catch((err) => {
        console.error('Error notifying customers about new book:', err);
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ POST /api/books - Success in ${duration}ms`);
    
    const response = NextResponse.json({ book }, { status: 201 });
    // Add CORS headers to success response
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ POST /api/books - Error after ${duration}ms:`, error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
    // Add CORS headers to error response
    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    return errorResponse;
  }
}




