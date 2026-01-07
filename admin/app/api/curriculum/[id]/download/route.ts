import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/curriculum/[id]/download - Get signed URL for curriculum PDF download
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    
    // Get curriculum PDF URL
    const { data: curriculum, error } = await supabase
      .from('curriculum')
      .select('pdf_url')
      .eq('id', id)
      .single();
    
    if (error || !curriculum?.pdf_url) {
      return NextResponse.json(
        { error: 'Curriculum PDF not found' },
        { status: 404 }
      );
    }
    
    // Extract file path from URL
    // Supabase Storage URL format: https://project.supabase.co/storage/v1/object/public/bucket/path/to/file.pdf
    // Or signed URL format: https://project.supabase.co/storage/v1/object/sign/bucket/path/to/file.pdf?token=...
    let filePath = curriculum.pdf_url;
    let bucket = 'books'; // Default bucket
    
    console.log('Original PDF URL:', filePath);
    
    // If it's already a signed URL, return as is
    if (filePath.includes('/storage/v1/object/sign/')) {
      return NextResponse.json({
        downloadUrl: curriculum.pdf_url,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });
    }
    
    // If it's a public URL, extract the path
    if (filePath.includes('/storage/v1/object/public/')) {
      const urlParts = filePath.split('/storage/v1/object/public/');
      if (urlParts[1]) {
        const pathParts = urlParts[1].split('/');
        bucket = pathParts[0];
        filePath = pathParts.slice(1).join('/');
        console.log('Extracted from public URL:', { bucket, filePath });
      }
    } else if (filePath.startsWith('http')) {
      // Try to parse as URL
      try {
        const url = new URL(filePath);
        const pathname = url.pathname;
        // Extract from pathname: /storage/v1/object/public/bucket/path
        const match = pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        if (match) {
          bucket = match[1];
          filePath = match[2];
          console.log('Extracted from URL pathname:', { bucket, filePath });
        }
      } catch (e) {
        console.warn('Could not parse URL, using as path:', e);
      }
    }
    
    // If filePath still looks like a full URL, try to extract just the filename
    if (filePath.includes('http') || filePath.includes('supabase.co')) {
      const urlParts = filePath.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      // Remove query parameters if any
      const fileName = lastPart.split('?')[0];
      if (fileName && fileName.includes('.')) {
        // Try to find the path in the URL
        const pathMatch = filePath.match(/curriculum\/pdfs\/(.+)/);
        if (pathMatch) {
          filePath = `curriculum/pdfs/${pathMatch[1].split('?')[0]}`;
        } else {
          filePath = fileName;
        }
        console.log('Extracted filename/path:', filePath);
      }
    }
    
    console.log('Final values for signed URL:', { bucket, filePath });
    
    // Generate signed URL (expires in 1 hour)
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    if (urlError || !signedUrl) {
      console.error('Error generating signed URL:', urlError);
      // If signed URL fails, return the original URL (might be public)
      return NextResponse.json({
        downloadUrl: curriculum.pdf_url,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        note: 'Using original URL (signed URL generation failed)',
      });
    }
    
    return NextResponse.json({
      downloadUrl: signedUrl.signedUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    });
  } catch (error) {
    console.error('Error in GET /api/curriculum/[id]/download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
