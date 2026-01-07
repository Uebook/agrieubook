import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/curriculum/[id]/image - Get signed URL for curriculum banner image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    
    // Get curriculum banner URL
    const { data: curriculum, error } = await supabase
      .from('curriculum')
      .select('banner_url')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching curriculum:', error);
      return NextResponse.json(
        { error: 'Curriculum not found', details: error.message },
        { status: 404 }
      );
    }
    
    if (!curriculum?.banner_url) {
      console.log('No banner_url found for curriculum:', id);
      return NextResponse.json(
        { error: 'Curriculum banner image not found' },
        { status: 404 }
      );
    }
    
    // Extract file path from URL
    let filePath = curriculum.banner_url;
    let bucket = 'books'; // Default bucket
    
    console.log('Original banner URL from DB:', filePath);
    
    // If it's already a signed URL, return as is (but check if it's expired)
    if (filePath.includes('/storage/v1/object/sign/')) {
      return NextResponse.json({
        imageUrl: curriculum.banner_url,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });
    }
    
    // Try multiple methods to extract bucket and path
    
    // Method 1: Public URL format - /storage/v1/object/public/bucket/path
    if (filePath.includes('/storage/v1/object/public/')) {
      const urlParts = filePath.split('/storage/v1/object/public/');
      if (urlParts[1]) {
        const pathParts = urlParts[1].split('/');
        bucket = pathParts[0];
        filePath = pathParts.slice(1).join('/');
        // Remove query parameters if any
        filePath = filePath.split('?')[0];
        console.log('Method 1 - Extracted from public URL:', { bucket, filePath });
      }
    }
    // Method 2: Try parsing as full URL
    else if (filePath.startsWith('http')) {
      try {
        const url = new URL(filePath);
        const pathname = url.pathname;
        
        // Try public URL pattern
        const publicMatch = pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        if (publicMatch) {
          bucket = publicMatch[1];
          filePath = publicMatch[2];
          console.log('Method 2a - Extracted from URL pathname (public):', { bucket, filePath });
        }
        // Try signed URL pattern
        else {
          const signedMatch = pathname.match(/\/storage\/v1\/object\/sign\/([^/]+)\/(.+)/);
          if (signedMatch) {
            bucket = signedMatch[1];
            filePath = signedMatch[2];
            console.log('Method 2b - Extracted from URL pathname (signed):', { bucket, filePath });
          }
        }
      } catch (e) {
        console.warn('Could not parse URL:', e);
      }
    }
    
    // Method 3: If filePath still contains full URL, try to extract folder path
    if (filePath.includes('http') || filePath.includes('supabase.co')) {
      // Try to find known folder patterns
      const folderPatterns = [
        /curriculum\/banners\/([^?]+)/,
        /audio-books\/covers\/([^?]+)/,
        /books\/covers\/([^?]+)/,
        /books\/([^?]+)/,
      ];
      
      for (const pattern of folderPatterns) {
        const match = filePath.match(pattern);
        if (match) {
          filePath = match[0].split('?')[0];
          console.log('Method 3 - Extracted from folder pattern:', filePath);
          break;
        }
      }
      
      // If no pattern matched, try to get the last meaningful part
      if (filePath.includes('http')) {
        const urlParts = filePath.split('/');
        // Find the part after 'public' or 'sign'
        const publicIndex = urlParts.findIndex((p: string) => p === 'public' || p === 'sign');
        if (publicIndex !== -1) {
          const nextIndex = publicIndex + 1;
          if (nextIndex < urlParts.length) {
            const bucketCandidate = urlParts[nextIndex];
            if (bucketCandidate) {
              bucket = bucketCandidate;
              const pathStartIndex = nextIndex + 1;
              if (pathStartIndex < urlParts.length) {
                filePath = urlParts.slice(pathStartIndex).join('/').split('?')[0];
              } else {
                filePath = '';
              }
              console.log('Method 3b - Extracted from URL parts:', { bucket, filePath });
            }
          }
        }
        
        // Last resort: use filename if we still don't have a good path
        if (!filePath || filePath.includes('http')) {
          const lastPart = urlParts[urlParts.length - 1];
          if (lastPart) {
            const fileName = lastPart.split('?')[0];
            if (fileName && fileName.includes('.')) {
              filePath = fileName;
              console.log('Method 3c - Using filename only:', filePath);
            }
          }
        }
      }
    }
    
    // Method 4: If filePath doesn't look like a URL, it might already be a path
    if (!filePath.includes('http') && !filePath.includes('supabase.co') && filePath.includes('/')) {
      // It's already a path, use as is
      console.log('Method 4 - Using as-is path:', filePath);
    }
    
    console.log('Final values for signed URL:', { bucket, filePath });
    
    // First, try to generate a signed URL (works for both public and private buckets)
    console.log(`Attempting to generate signed URL for bucket: ${bucket}, path: ${filePath}`);
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 31536000); // 1 year expiry
    
    if (!signedUrlError && signedUrlData?.signedUrl) {
      console.log('Successfully generated signed URL');
      return NextResponse.json({
        imageUrl: signedUrlData.signedUrl,
        expiresAt: new Date(Date.now() + 31536000000).toISOString(), // 1 year expiry
      });
    }
    
    // If signed URL fails, try public URL
    console.warn('Signed URL generation failed, trying public URL:', signedUrlError);
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    let finalImageUrl = publicUrlData.publicUrl;
    
    // If public URL is not valid, return original URL as fallback
    if (!finalImageUrl || finalImageUrl.includes('null')) {
      console.warn('Public URL also invalid, returning original URL');
      return NextResponse.json({
        imageUrl: curriculum.banner_url,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        note: 'Using original URL (both signed and public URL generation failed)',
        debug: {
          bucket,
          filePath,
          signedUrlError: signedUrlError?.message,
        },
      });
    }
    
    console.log('Using public URL:', finalImageUrl);
    return NextResponse.json({
      imageUrl: finalImageUrl,
      expiresAt: new Date(Date.now() + 31536000000).toISOString(), // 1 year for public
    });
  } catch (error: any) {
    console.error('Error in GET /api/curriculum/[id]/image:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
