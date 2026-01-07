import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/curriculum/:id - Get single curriculum
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    
    const { data: curriculum, error } = await supabase
      .from('curriculum')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching curriculum:', error);
      return NextResponse.json(
        { error: 'Curriculum not found' },
        { status: 404 }
      );
    }
    
    if (!curriculum) {
      return NextResponse.json(
        { error: 'Curriculum not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ curriculum });
  } catch (error) {
    console.error('Error in GET /api/curriculum/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/curriculum/:id - Update curriculum
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
      state,
      state_name,
      language,
      banner_url,
      pdf_url,
      cover_image_url,
      published_date,
      scheme_name,
      grade,
      subject,
      status,
    } = body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (state !== undefined) updateData.state = state;
    if (state_name !== undefined) updateData.state_name = state_name;
    if (language !== undefined) updateData.language = language;
    if (banner_url !== undefined) updateData.banner_url = banner_url;
    if (pdf_url !== undefined) updateData.pdf_url = pdf_url;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (published_date !== undefined) updateData.published_date = published_date;
    if (scheme_name !== undefined) updateData.scheme_name = scheme_name;
    if (grade !== undefined) updateData.grade = grade;
    if (subject !== undefined) updateData.subject = subject;
    if (status !== undefined) updateData.status = status;
    
    updateData.updated_at = new Date().toISOString();
    
    const { data: updatedCurriculum, error } = await supabase
      .from('curriculum')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating curriculum:', error);
      return NextResponse.json(
        { error: 'Failed to update curriculum' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ curriculum: updatedCurriculum });
  } catch (error) {
    console.error('Error in PUT /api/curriculum/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/curriculum/:id - Delete curriculum
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    
    const { error } = await supabase
      .from('curriculum')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting curriculum:', error);
      return NextResponse.json(
        { error: 'Failed to delete curriculum' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Curriculum deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/curriculum/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
