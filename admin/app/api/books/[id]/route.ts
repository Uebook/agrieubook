import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/books/[id] - Get single book
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    
    const { data: book, error } = await supabase
      .from('books')
      .select(`
        *,
        author:authors(*),
        category:categories(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching book:', error);
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await supabase.rpc('increment_book_views', {
      book_id_param: id,
    });
    
    return NextResponse.json({ book });
  } catch (error) {
    console.error('Error in GET /api/books/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/books/[id] - Update book
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();
    
    const { data: book, error } = await supabase
      .from('books')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating book:', error);
      return NextResponse.json(
        { error: 'Failed to update book' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ book });
  } catch (error) {
    console.error('Error in PUT /api/books/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[id] - Delete book
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    
    // Get book to delete PDF file
    const { data: book } = await supabase
      .from('books')
      .select('pdf_url')
      .eq('id', id)
      .single();
    
    // Delete from database
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting book:', error);
      return NextResponse.json(
        { error: 'Failed to delete book' },
        { status: 500 }
      );
    }
    
    // Delete PDF file from storage if exists
    if (book?.pdf_url) {
      const fileName = book.pdf_url.split('/').pop();
      await supabase.storage
        .from('books')
        .remove([fileName || '']);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/books/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


