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
        { error: 'Missing required fields: title, author_id, and category_id are required' },
        { status: 400 }
      );
    }
    
    // Check if author exists, if not create one from user data
    let finalAuthorId = author_id;
    const { data: existingAuthor, error: authorCheckError } = await supabase
      .from('authors')
      .select('id')
      .eq('id', author_id)
      .single();
    
    if (!existingAuthor && !authorCheckError) {
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
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            avatar_url: userData.avatar_url,
            status: 'active',
          })
          .select()
          .single();
        
        if (createAuthorError) {
          console.error('Error creating author:', createAuthorError);
          // Continue anyway - might be a duplicate key error
        } else {
          finalAuthorId = newAuthor.id;
        }
      }
    }
    
    // Validate category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single();
    
    if (!category || categoryError) {
      return NextResponse.json(
        { error: 'Invalid category_id: Category does not exist' },
        { status: 400 }
      );
    }
    
    // Insert book
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
        pdf_url,
        cover_image_url,
        cover_images: Array.isArray(cover_images) ? cover_images : (cover_images ? [cover_images] : []),
        published_date: published_date || new Date().toISOString(),
        status: 'pending',
      })
      .select()
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
      return NextResponse.json(
        { error: errorMessage, details: error },
        { status: 500 }
      );
    }
    
    // Update author's books count (ignore errors if RPC doesn't exist)
    try {
      await supabase.rpc('increment_author_books', {
        author_id_param: finalAuthorId,
      });
    } catch (rpcError) {
      console.warn('Could not increment author books count:', rpcError);
      // Not critical, continue
    }
    
    return NextResponse.json({ book }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/books:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}




