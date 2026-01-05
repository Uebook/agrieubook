import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/books/:id - Get single book by ID
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

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ book });
  } catch (error) {
    console.error('Error in GET /api/books/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/books/:id - Update book
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();

    const {
      title,
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
      status,
    } = body;

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (price !== undefined) updateData.price = price;
    if (original_price !== undefined) updateData.original_price = original_price;
    if (pages !== undefined) updateData.pages = pages;
    if (language !== undefined) updateData.language = language;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (isbn !== undefined) updateData.isbn = isbn;
    if (is_free !== undefined) updateData.is_free = is_free;
    if (pdf_url !== undefined) updateData.pdf_url = pdf_url;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (cover_images !== undefined) updateData.cover_images = cover_images;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedBook, error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:authors(*),
        category:categories(*)
      `)
      .single();

    if (error) {
      console.error('Error updating book:', error);
      return NextResponse.json(
        { error: 'Failed to update book' },
        { status: 500 }
      );
    }

    return NextResponse.json({ book: updatedBook });
  } catch (error) {
    console.error('Error in PUT /api/books/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/books/:id - Delete book
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

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

    return NextResponse.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/books/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
