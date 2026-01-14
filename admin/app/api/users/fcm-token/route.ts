import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

/**
 * OPTIONS /api/users/fcm-token
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * GET /api/users/fcm-token
 * Test endpoint to verify route is accessible
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'FCM token endpoint is accessible',
    methods: ['POST', 'OPTIONS', 'GET'],
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * POST /api/users/fcm-token
 * Update or save FCM token for a user
 */
export async function POST(request: NextRequest) {
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { user_id, fcm_token } = body;

    console.log('📱 FCM Token Update Request:', { user_id, fcm_token: fcm_token ? `${fcm_token.substring(0, 20)}...` : 'missing' });

    if (!user_id || !fcm_token) {
      console.error('❌ Missing required fields:', { user_id: !!user_id, fcm_token: !!fcm_token });
      return NextResponse.json(
        { error: 'user_id and fcm_token are required' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const supabase = createServerClient();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      console.error('❌ User not found:', userError);
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { 
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    console.log('✅ User found, updating FCM token...');

    // Update user's FCM token
    // Try to update, but handle case where columns might not exist
    const updateData: any = {
      fcm_token: fcm_token,
    };

    // Only add fcm_token_updated_at if column exists (to avoid errors)
    try {
      updateData.fcm_token_updated_at = new Date().toISOString();
    } catch (e) {
      // Ignore if column doesn't exist
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating FCM token:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // If column doesn't exist, return helpful error
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        return NextResponse.json(
          {
            error: 'FCM token column not found. Please run the database migration to add fcm_token column.',
            details: error.message,
            migration_sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT; ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token_updated_at TIMESTAMP;',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to update FCM token',
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log('✅ FCM token updated successfully for user:', user_id);

    return NextResponse.json({
      success: true,
      message: 'FCM token updated successfully',
      user_id: user_id,
      fcm_token: fcm_token.substring(0, 20) + '...',
    }, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('❌ Error in POST /api/users/fcm-token:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error',
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}
