import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/authors/[id] - Get single author
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    
    // First try to get from users table (publishers/authors)
    const { data: userAuthor, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .in('role', ['publisher', 'author'])
      .single();
    
    // Also try to get from authors table
    const { data: authorTable, error: authorError } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .single();
    
    // Merge data from both sources
    let author: any = null;
    
    if (userAuthor) {
      author = {
        id: userAuthor.id,
        name: userAuthor.name,
        email: userAuthor.email,
        mobile: userAuthor.mobile,
        bio: userAuthor.bio || userAuthor.description || '',
        avatar_url: userAuthor.avatar_url,
        status: userAuthor.status || 'active',
        role: userAuthor.role,
        created_at: userAuthor.created_at,
      };
      
      // Merge with authors table data if exists
      if (authorTable) {
        author = { ...author, ...authorTable };
      }
    } else if (authorTable) {
      author = authorTable;
    }
    
    // Get book counts
    if (author) {
      const { data: bookCounts } = await supabase
        .from('books')
        .select('id')
        .eq('author_id', id);
      
      const { data: audioBookCounts } = await supabase
        .from('audio_books')
        .select('id')
        .eq('author_id', id);
      
      author.books_count = bookCounts?.length || 0;
      author.audio_books_count = audioBookCounts?.length || 0;
    }
    
    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ author });
  } catch (error) {
    console.error('Error in GET /api/authors/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/authors/[id] - Update author
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const body = await request.json();
    
    const { data: author, error } = await supabase
      .from('authors')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating author:', error);
      return NextResponse.json(
        { error: 'Failed to update author' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ author });
  } catch (error) {
    console.error('Error in PUT /api/authors/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/authors/[id] - Delete author
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    
    const { error } = await supabase
      .from('authors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting author:', error);
      return NextResponse.json(
        { error: 'Failed to delete author' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/authors/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


