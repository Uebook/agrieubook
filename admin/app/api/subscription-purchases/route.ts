import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/subscription-purchases - Get all subscription purchases (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'active', 'expired', 'cancelled', 'all'

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // Get subscription purchases from payments table
    let paymentsQuery = supabase
      .from('payments')
      .select(`
        *,
        user:users(id, name, email),
        subscription_type:subscription_types(id, name, type, price, duration_days)
      `)
      .eq('status', 'completed') // Only completed payments
      .not('subscription_type_id', 'is', null) // Only subscription purchases
      .order('created_at', { ascending: false });

    const { data: payments, error: paymentsError } = await paymentsQuery;

    if (paymentsError) {
      console.error('Error fetching subscription purchases:', paymentsError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription purchases', details: paymentsError.message },
        { status: 500 }
      );
    }

    // Get user subscriptions to check status
    const userIds = [...new Set((payments || []).map((p: any) => p.user_id))];
    const { data: userSubscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .in('user_id', userIds);

    // Create a map of user_id -> active subscription
    const userSubMap = new Map();
    (userSubscriptions || []).forEach((sub: any) => {
      if (sub.status === 'active' && (!sub.end_date || new Date(sub.end_date) > new Date())) {
        userSubMap.set(sub.user_id, sub);
      }
    });

    // Transform payments to subscription purchases format
    let purchases = (payments || []).map((payment: any) => {
      const userSub = userSubMap.get(payment.user_id);
      let purchaseStatus = 'expired';
      
      if (userSub && userSub.subscription_type_id === payment.subscription_type_id) {
        if (userSub.status === 'active' && (!userSub.end_date || new Date(userSub.end_date) > new Date())) {
          purchaseStatus = 'active';
        } else if (userSub.status === 'cancelled') {
          purchaseStatus = 'cancelled';
        }
      }

      return {
        id: payment.id,
        user_id: payment.user_id,
        subscription_type_id: payment.subscription_type_id,
        amount: parseFloat(payment.amount) || 0,
        purchased_at: payment.created_at || payment.purchased_at,
        status: purchaseStatus,
        user: payment.user,
        subscription_type: payment.subscription_type,
        payment: {
          payment_method: payment.payment_method,
          transaction_id: payment.transaction_id,
          status: payment.status,
        },
      };
    });

    // Filter by status if specified
    if (status && status !== 'all') {
      purchases = purchases.filter((p: any) => p.status === status);
    }

    // Sort by date (newest first)
    purchases.sort((a: any, b: any) => {
      const dateA = new Date(a.purchased_at || 0).getTime();
      const dateB = new Date(b.purchased_at || 0).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const total = purchases.length;
    const paginatedPurchases = purchases.slice(offset, offset + limit);

    return NextResponse.json({
      purchases: paginatedPurchases,
      pagination: {
        page,
        limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/subscription-purchases:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
