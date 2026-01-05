import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/youtube-channels - Get all active YouTube channels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from('youtube_channels')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.contains('category_ids', [category]);
    }

    const { data: channels, error } = await query;

    if (error) {
      console.error('Error fetching YouTube channels:', error);
      return NextResponse.json(
        { error: 'Failed to fetch YouTube channels' },
        { status: 500 }
      );
    }

    // Get total count
    let countQuery = supabase
      .from('youtube_channels')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (category) {
      countQuery = countQuery.contains('category_ids', [category]);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      channels: channels || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/youtube-channels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/youtube-channels - Create new YouTube channel (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      channel_url,
      thumbnail_url,
      subscriber_count,
      video_count,
      verified,
      category_ids,
    } = body;

    if (!name || !channel_url) {
      return NextResponse.json(
        { error: 'name and channel_url are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('youtube_channels')
      .insert({
        name,
        description,
        channel_url,
        thumbnail_url,
        subscriber_count,
        video_count,
        verified: verified || false,
        category_ids: category_ids || [],
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating YouTube channel:', error);
      return NextResponse.json(
        { error: 'Failed to create YouTube channel' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      channel: data,
    });
  } catch (error) {
    console.error('Error in POST /api/youtube-channels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

