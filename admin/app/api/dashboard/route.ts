import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get total books
    const { count: totalBooks } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    // Get total audio books
    const { count: totalAudioBooks } = await supabase
      .from('audio_books')
      .select('*', { count: 'exact', head: true });

    // Get total authors
    const { count: totalAuthors } = await supabase
      .from('authors')
      .select('*', { count: 'exact', head: true });

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get pending books
    const { count: pendingBooks } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get pending audio books
    const { count: pendingAudioBooks } = await supabase
      .from('audio_books')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get active users
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get payments (if you have a payments table later)
    // For now, return 0
    const totalPayments = 0;
    const totalRevenue = 0;
    const authorRevenue: any[] = [];

    return NextResponse.json({
      totalBooks: totalBooks || 0,
      totalAudioBooks: totalAudioBooks || 0,
      totalAuthors: totalAuthors || 0,
      totalUsers: totalUsers || 0,
      totalRevenue,
      totalPayments,
      pendingBooks: pendingBooks || 0,
      pendingAudioBooks: pendingAudioBooks || 0,
      activeUsers: activeUsers || 0,
      authorRevenue,
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


