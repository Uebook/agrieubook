import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/authors/[id] - Get single author
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    
    const { data: author, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching author:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    
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


