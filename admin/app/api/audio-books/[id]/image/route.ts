import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/audio-books/[id]/image - Get signed URL for audio book cover image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    
    // Get audio book cover URL
    const { data: audioBook, error } = await supabase
      .from('audio_books')
      .select('cover_url')
      .eq('id', id)
      .single();
    
    if (error || !audioBook?.cover_url) {
      return NextResponse.json(
        { error: 'Audio book cover image not found' },
        { status: 404 }
      );
    }
    
    // Extract file path from URL
    let filePath = audioBook.cover_url;
    let bucket = 'books'; // Default bucket
    
    console.log('Original cover URL from DB:', filePath);
    
    // If it's already a signed URL, return as is
    if (filePath.includes('/storage/v1/object/sign/')) {
      return NextResponse.json({
        imageUrl: audioBook.cover_url,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });
    }
    
    // Extract bucket and path from URL
    if (filePath.includes('/storage/v1/object/public/')) {
      const urlParts = filePath.split('/storage/v1/object/public/');
      if (urlParts[1]) {
        const pathParts = urlParts[1].split('/');
        bucket = pathParts[0];
        filePath = pathParts.slice(1).join('/').split('?')[0];
      }
    } else if (filePath.startsWith('http')) {
      try {
        const url = new URL(filePath);
        const pathname = url.pathname;
        const match = pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        if (match) {
          bucket = match[1];
          filePath = match[2];
        }
      } catch (e) {
        console.warn('Could not parse URL:', e);
      }
    }
    
    // Try to extract folder path
    if (filePath.includes('audio-books/covers')) {
      const match = filePath.match(/audio-books\/covers\/(.+)/);
      if (match) {
        filePath = `audio-books/covers/${match[1].split('?')[0]}`;
      }
    }
    
    console.log('Final values for signed URL:', { bucket, filePath });
    
    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 31536000); // 1 year expiry
    
    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Error generating signed URL:', signedUrlError);
      // Return original URL as fallback
      return NextResponse.json({
        imageUrl: audioBook.cover_url,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });
    }
    
    return NextResponse.json({
      imageUrl: signedUrlData.signedUrl,
      expiresAt: new Date(Date.now() + 31536000000).toISOString(),
    });
  } catch (error: any) {
    console.error('Error in GET /api/audio-books/[id]/image:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
