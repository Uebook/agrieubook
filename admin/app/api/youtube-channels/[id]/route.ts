import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/youtube-channels/[id] - Get single YouTube channel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: channel, error } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching YouTube channel:', error);
      return NextResponse.json(
        { error: 'YouTube channel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Error in GET /api/youtube-channels/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/youtube-channels/[id] - Update YouTube channel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    const {
      name,
      description,
      channel_url,
      thumbnail_url,
      subscriber_count,
      video_count,
      verified,
      category_ids,
      is_active,
    } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (channel_url !== undefined) updateData.channel_url = channel_url;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (subscriber_count !== undefined) updateData.subscriber_count = subscriber_count;
    if (video_count !== undefined) updateData.video_count = video_count;
    if (verified !== undefined) updateData.verified = verified;
    if (category_ids !== undefined) updateData.category_ids = category_ids;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: channel, error } = await supabase
      .from('youtube_channels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating YouTube channel:', error);
      return NextResponse.json(
        { error: 'Failed to update YouTube channel' },
        { status: 500 }
      );
    }

    if (!channel) {
      return NextResponse.json(
        { error: 'YouTube channel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ channel });
  } catch (error: any) {
    console.error('Error in PUT /api/youtube-channels/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/youtube-channels/[id] - Delete YouTube channel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { error } = await supabase
      .from('youtube_channels')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting YouTube channel:', error);
      return NextResponse.json(
        { error: 'Failed to delete YouTube channel' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'YouTube channel deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/youtube-channels/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
