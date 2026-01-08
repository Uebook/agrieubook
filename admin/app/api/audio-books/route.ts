import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/audio-books - List audio books with pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status'); // Don't default to 'published', allow 'all'
    const authorId = searchParams.get('authorId') || searchParams.get('author'); // Support both parameter names
    
    let query = supabase
      .from('audio_books')
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
    }
    
    // Apply author filter if provided
    if (authorId) {
      query = query.eq('author_id', authorId);
    }
    
    const { data: audioBooks, error } = await query;
    
    if (error) {
      console.error('Error fetching audio books:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audio books' },
        { status: 500 }
      );
    }
    
    let countQuery = supabase
      .from('audio_books')
      .select('*', { count: 'exact', head: true });
    
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    
    if (authorId) {
      countQuery = countQuery.eq('author_id', authorId);
    }
    
    const { count: totalCount } = await countQuery;
    
    return NextResponse.json({
      audioBooks: audioBooks || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/audio-books:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/audio-books - Create new audio book
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    const {
      title,
      author_id,
      description,
      audio_url,
      cover_url,
      duration,
      language,
      category_id,
      is_free,
      published_date,
    } = body;
    
    // Validate required fields
    if (!title || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title and author_id are required' },
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
    
    // Validate category exists (if provided)
    if (category_id) {
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
    }
    
    // Insert audio book
    const { data: audioBook, error } = await supabase
      .from('audio_books')
      .insert({
        title,
        author_id: finalAuthorId,
        description,
        audio_url,
        cover_url,
        duration: duration || '00:00',
        language: language || 'English',
        category_id,
        is_free: is_free !== undefined ? is_free : true,
        published_date: published_date || new Date().toISOString(),
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating audio book:', error);
      // Provide more detailed error message
      let errorMessage = 'Failed to create audio book';
      if (error.code === '23503') {
        errorMessage = 'Foreign key constraint failed. Please ensure author and category exist.';
      } else if (error.code === '23505') {
        errorMessage = 'Duplicate entry. An audio book with this title may already exist.';
      } else if (error.message) {
        errorMessage = `Failed to create audio book: ${error.message}`;
      }
      return NextResponse.json(
        { error: errorMessage, details: error },
        { status: 500 }
      );
    }
    
    // Update author's audio books count (ignore errors if RPC doesn't exist)
    try {
      await supabase.rpc('increment_author_audio_books', {
        author_id_param: finalAuthorId,
      });
    } catch (rpcError) {
      console.warn('Could not increment author audio books count:', rpcError);
      // Not critical, continue
    }
    
    return NextResponse.json({ audioBook }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/audio-books:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


