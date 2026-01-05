import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/audio-books/:id - Get single audio book by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    const { data: audioBook, error } = await supabase
      .from('audio_books')
      .select(`
        *,
        author:authors(*),
        category:categories(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching audio book:', error);
      return NextResponse.json(
        { error: 'Audio book not found' },
        { status: 404 }
      );
    }

    if (!audioBook) {
      return NextResponse.json(
        { error: 'Audio book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ audioBook });
  } catch (error) {
    console.error('Error in GET /api/audio-books/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/audio-books/:id - Update audio book
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      duration,
      language,
      category_id,
      audio_url,
      cover_url,
    } = body;

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (language !== undefined) updateData.language = language;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (audio_url !== undefined) updateData.audio_url = audio_url;
    if (cover_url !== undefined) updateData.cover_url = cover_url;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedAudioBook, error } = await supabase
      .from('audio_books')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:authors(*),
        category:categories(*)
      `)
      .single();

    if (error) {
      console.error('Error updating audio book:', error);
      return NextResponse.json(
        { error: 'Failed to update audio book' },
        { status: 500 }
      );
    }

    return NextResponse.json({ audioBook: updatedAudioBook });
  } catch (error) {
    console.error('Error in PUT /api/audio-books/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/audio-books/:id - Delete audio book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    const { error } = await supabase
      .from('audio_books')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting audio book:', error);
      return NextResponse.json(
        { error: 'Failed to delete audio book' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Audio book deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/audio-books/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
