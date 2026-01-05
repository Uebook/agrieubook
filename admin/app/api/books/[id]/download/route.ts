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
    // Supabase Storage URL format: https://project.supabase.co/storage/v1/object/public/bucket/file.pdf
    const urlParts = book.pdf_url.split('/');
    const bucket = urlParts[urlParts.length - 2];
    const fileName = urlParts[urlParts.length - 1];
    
    // Generate signed URL (expires in 1 hour)
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(fileName, 3600); // 1 hour expiry
    
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




