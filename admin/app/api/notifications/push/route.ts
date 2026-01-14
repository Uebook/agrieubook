import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { sendPushNotification } from '@/lib/firebase/admin';

/**
 * POST /api/notifications/push
 * Send Firebase push notification to user(s)
 * 
 * Body:
 * - user_id: string (optional, if not provided, sends to all users)
 * - user_ids: string[] (optional, send to multiple users)
 * - role: 'reader' | 'author' | 'admin' (optional, send to all users with this role)
 * - title: string (required)
 * - body: string (required)
 * - data: object (optional, custom data to pass with notification)
 */
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { user_id, user_ids, role, title, body: messageBody, data } = requestBody;

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: 'title and body are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    let targetUserIds: string[] = [];

    // Determine target users
    if (user_id) {
      targetUserIds = [user_id];
    } else if (user_ids && Array.isArray(user_ids)) {
      targetUserIds = user_ids;
    } else if (role) {
      // Get all users with the specified role
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('role', role);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        );
      }

      targetUserIds = users?.map((u) => u.id) || [];
    } else {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        );
      }

      targetUserIds = users?.map((u) => u.id) || [];
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: 'No users found to send notification to' },
        { status: 400 }
      );
    }

    // Get FCM tokens for target users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, fcm_token')
      .in('id', targetUserIds)
      .not('fcm_token', 'is', null);

    if (usersError) {
      console.error('Error fetching FCM tokens:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch FCM tokens' },
        { status: 500 }
      );
    }

    const fcmTokens = users?.map((u) => u.fcm_token).filter(Boolean) || [];

    if (fcmTokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No FCM tokens found for target users',
          target_users: targetUserIds.length,
          tokens_found: 0,
        },
        { status: 200 }
      );
    }

    // Send push notifications via Firebase Admin SDK
    const sendResults = await sendPushNotification(fcmTokens, title, messageBody, data);

    // Also create in-app notifications in the database
    const notifications = targetUserIds.map((uid) => ({
      user_id: uid,
      title,
      message: messageBody,
      description: data?.description || null,
      image_url: data?.imageUrl || null,
      icon: data?.icon || '🔔',
      type: data?.type || 'info',
      action_type: data?.action_type,
      action_screen: data?.action_screen,
      action_params: data?.action_params || data,
    }));

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifError) {
      console.error('Error creating in-app notifications:', notifError);
      // Don't fail the request if in-app notification creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Push notifications sent',
      target_users: targetUserIds.length,
      tokens_found: fcmTokens.length,
      notifications_sent: sendResults.successCount,
      notifications_failed: sendResults.failureCount,
    });
  } catch (error) {
    console.error('Error in POST /api/notifications/push:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

