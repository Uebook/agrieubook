import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/authors - List authors with pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    const { data: authors, error } = await supabase
      .from('authors')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching authors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch authors' },
        { status: 500 }
      );
    }
    
    const { count: totalCount } = await supabase
      .from('authors')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({
      authors: authors || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/authors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/authors - Create new author
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    const { name, email, mobile, bio, avatar_url, status } = body;
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { data: author, error } = await supabase
      .from('authors')
      .insert({
        name,
        email,
        mobile,
        bio,
        avatar_url,
        status: status || 'active',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating author:', error);
      return NextResponse.json(
        { error: 'Failed to create author' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ author }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/authors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


