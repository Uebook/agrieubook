import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

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
    const authorId = searchParams.get('author');
    const language = searchParams.get('language');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'published';
    
    // Build query
    let query = supabase
      .from('books')
      .select(`
        *,
        author:authors(*),
        category:categories(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId);
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
      console.error('Error fetching books:', error);
      return NextResponse.json(
        { error: 'Failed to fetch books' },
        { status: 500 }
      );
    }
    
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    
    return NextResponse.json({
      books: books || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/books:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create new book
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
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
    } = body;
    
    // Validate required fields
    if (!title || !author_id || !category_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { data: book, error } = await supabase
      .from('books')
      .insert({
        title,
        author_id,
        summary,
        price: price || 0,
        original_price: original_price || price || 0,
        pages,
        language: language || 'English',
        category_id,
        isbn,
        is_free: is_free || false,
        pdf_url,
        cover_image_url,
        cover_images: cover_images || [],
        published_date: published_date || new Date().toISOString(),
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating book:', error);
      return NextResponse.json(
        { error: 'Failed to create book' },
        { status: 500 }
      );
    }
    
    // Update author's books count
    await supabase.rpc('increment_author_books', {
      author_id_param: author_id,
    });
    
    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/books:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




