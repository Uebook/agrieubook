import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/books/[id]/download - Get signed URL for PDF download
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    
    // Get book PDF URL
    const { data: book, error } = await supabase
      .from('books')
      .select('pdf_url')
      .eq('id', id)
      .single();
    
    if (error || !book?.pdf_url) {
      return NextResponse.json(
        { error: 'Book PDF not found' },
        { status: 404 }
      );
    }
    
    // Extract file path from URL
    // Supabase Storage URL formats:
    // 1. Public: https://project.supabase.co/storage/v1/object/public/bucket/path/file.pdf
    // 2. Signed: https://project.supabase.co/storage/v1/object/sign/bucket/path/file.pdf?token=...
    // 3. Direct: https://project.supabase.co/storage/v1/object/public/bucket/file.pdf
    
    let filePath = '';
    let bucket = 'books'; // Default bucket
    
    // Parse the URL to extract bucket and file path
    const urlObj = new URL(book.pdf_url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the bucket name (usually after /storage/v1/object/public/ or /storage/v1/object/sign/)
    const objectIndex = pathParts.indexOf('object');
    if (objectIndex !== -1 && pathParts[objectIndex + 1]) {
      // Skip 'public' or 'sign' and get bucket
      const bucketIndex = objectIndex + 2;
      if (pathParts[bucketIndex]) {
        bucket = pathParts[bucketIndex];
        // Get the file path (everything after bucket)
        filePath = pathParts.slice(bucketIndex + 1).join('/');
      }
    }
    
    // If filePath is empty, try to extract from the end
    if (!filePath) {
      // Fallback: try to get from the last parts
      const lastParts = pathParts.slice(-2);
      if (lastParts.length === 2) {
        bucket = lastParts[0];
        filePath = lastParts[1];
      } else if (lastParts.length === 1) {
        filePath = lastParts[0];
      }
    }
    
    // Decode URL encoding in file path
    filePath = decodeURIComponent(filePath);
    
    console.log('📄 PDF URL parsing:', {
      originalUrl: book.pdf_url,
      bucket,
      filePath,
    });
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'Could not extract file path from PDF URL' },
        { status: 400 }
      );
    }
    
    // Generate signed URL (expires in 24 hours for better UX)
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 86400); // 24 hours expiry
    
    if (urlError || !signedUrl) {
      console.error('Error generating signed URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }
    
    // Option 1: Return signed URL (client downloads directly)
    return NextResponse.json({
      downloadUrl: signedUrl.signedUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    });
    
    // Option 2: Redirect to signed URL
    // return NextResponse.redirect(signedUrl.signedUrl);
    
    // Option 3: Stream file through API (not recommended for large files)
    // const { data: fileData, error: fileError } = await supabase.storage
    //   .from(bucket)
    //   .download(fileName);
    // if (fileError) throw fileError;
    // return new NextResponse(fileData, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="${fileName}"`,
    //   },
    // });
  } catch (error) {
    console.error('Error in GET /api/books/[id]/download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




