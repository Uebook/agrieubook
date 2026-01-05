import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const filter = searchParams.get('filter') || 'all'; // all, unread, read

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filter === 'unread') {
      query = query.eq('is_read', false);
    } else if (filter === 'read') {
      query = query.eq('is_read', true);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Format notifications
    const formattedNotifications = notifications?.map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      icon: notif.icon || '🔔',
      type: notif.type,
      isRead: notif.is_read,
      timestamp: formatTimestamp(notif.created_at),
      action: notif.action_type
        ? {
            type: notif.action_type,
            screen: notif.action_screen,
            params: notif.action_params || {},
          }
        : null,
    })) || [];

    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      title,
      message,
      icon,
      type,
      action_type,
      action_screen,
      action_params,
    } = body;

    if (!user_id || !title || !message) {
      return NextResponse.json(
        { error: 'user_id, title, and message are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        icon: icon || '🔔',
        type: type || 'info',
        action_type,
        action_screen,
        action_params,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: data,
    });
  } catch (error) {
    console.error('Error in POST /api/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification_id, user_id, mark_all } = body;

    const supabase = createServerClient();

    if (mark_all && user_id) {
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user_id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json(
          { error: 'Failed to mark all as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } else if (notification_id) {
      // Mark single as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id);

      if (error) {
        console.error('Error marking as read:', error);
        return NextResponse.json(
          { error: 'Failed to mark as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
      });
    } else {
      return NextResponse.json(
        { error: 'notification_id or (user_id and mark_all) required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

