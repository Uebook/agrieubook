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
    const status = searchParams.get('status') || 'published';
    
    let query = supabase
      .from('audio_books')
      .select(`
        *,
        author:authors(*),
        category:categories(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data: audioBooks, error } = await query;
    
    if (error) {
      console.error('Error fetching audio books:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audio books' },
        { status: 500 }
      );
    }
    
    const { count: totalCount } = await supabase
      .from('audio_books')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    
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
    
    if (!title || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { data: audioBook, error } = await supabase
      .from('audio_books')
      .insert({
        title,
        author_id,
        description,
        audio_url,
        cover_url,
        duration,
        language: language || 'English',
        category_id,
        is_free: is_free || true,
        published_date: published_date || new Date().toISOString(),
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating audio book:', error);
      return NextResponse.json(
        { error: 'Failed to create audio book' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ audioBook }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/audio-books:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


