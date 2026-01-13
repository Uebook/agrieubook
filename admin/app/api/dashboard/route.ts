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

    // Get payments and revenue from payments table
    let totalPayments = 0;
    let totalRevenue = 0;
    let totalPlatformCommission = 0;
    let totalGST = 0;
    let totalAuthorEarnings = 0;
    const authorRevenue: any[] = [];
    
    try {
      // Check if payments table exists by trying to query it
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, status, book_id, audio_book_id, created_at, platform_commission, gst_amount, author_earnings')
        .limit(1);
      
      // If table doesn't exist (PGRST116) or no error, try to fetch all payments
      if (paymentsError && paymentsError.code === 'PGRST116') {
        // Table doesn't exist, use defaults
        console.log('Payments table not found, using default values');
      } else if (!paymentsError) {
        // Table exists, fetch all payments
        const { data: allPayments } = await supabase
          .from('payments')
          .select('amount, status, book_id, audio_book_id, created_at, platform_commission, gst_amount, author_earnings, subscription_type_id');
        
        if (allPayments && allPayments.length > 0) {
          // Filter out subscription payments - only count book/audio book purchases
          const bookPayments = allPayments.filter(p => 
            (p.status === 'completed' || p.status === 'success') && 
            !p.subscription_type_id && 
            (p.book_id || p.audio_book_id)
          );
          
          totalPayments = bookPayments.length;
          // Calculate totals
          totalRevenue = bookPayments.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);
          totalPlatformCommission = bookPayments.reduce((sum, p) => sum + (parseFloat(String(p.platform_commission)) || 0), 0);
          totalGST = bookPayments.reduce((sum, p) => sum + (parseFloat(String(p.gst_amount)) || 0), 0);
          totalAuthorEarnings = bookPayments.reduce((sum, p) => sum + (parseFloat(String(p.author_earnings)) || 0), 0);
          
          // Calculate author revenue (group by author) - batch queries for efficiency
          const authorRevenueMap = new Map();
          const bookIds = [...new Set(successfulPayments.map(p => p.book_id).filter(Boolean))];
          const audioBookIds = [...new Set(successfulPayments.map(p => p.audio_book_id).filter(Boolean))];
          
          // Batch fetch books
          if (bookIds.length > 0) {
            const { data: books } = await supabase
              .from('books')
              .select('id, author_id')
              .in('id', bookIds);
            
            if (books) {
              const bookAuthorMap = new Map(books.map(b => [b.id, b.author_id]));
              for (const payment of successfulPayments) {
                if (payment.book_id && bookAuthorMap.has(payment.book_id)) {
                  const authorId = bookAuthorMap.get(payment.book_id);
                  const current = authorRevenueMap.get(authorId) || 0;
                  authorRevenueMap.set(authorId, current + (parseFloat(String(payment.amount)) || 0));
                }
              }
            }
          }
          
          // Batch fetch audio books
          if (audioBookIds.length > 0) {
            const { data: audioBooks } = await supabase
              .from('audio_books')
              .select('id, author_id')
              .in('id', audioBookIds);
            
            if (audioBooks) {
              const audioBookAuthorMap = new Map(audioBooks.map(ab => [ab.id, ab.author_id]));
              for (const payment of successfulPayments) {
                if (payment.audio_book_id && audioBookAuthorMap.has(payment.audio_book_id)) {
                  const authorId = audioBookAuthorMap.get(payment.audio_book_id);
                  const current = authorRevenueMap.get(authorId) || 0;
                  authorRevenueMap.set(authorId, current + (parseFloat(String(payment.amount)) || 0));
                }
              }
            }
          }
          
          // Convert map to array and get author names
          const authorIds = Array.from(authorRevenueMap.keys());
          if (authorIds.length > 0) {
            const { data: authors } = await supabase
              .from('authors')
              .select('id, name')
              .in('id', authorIds);
            
            if (authors) {
              const authorNameMap = new Map(authors.map(a => [a.id, a.name]));
              for (const [authorId, revenue] of authorRevenueMap.entries()) {
                authorRevenue.push({
                  authorId,
                  authorName: authorNameMap.get(authorId) || 'Unknown',
                  revenue: revenue,
                });
              }
              
              // Sort by revenue descending
              authorRevenue.sort((a, b) => b.revenue - a.revenue);
            }
          }
        }
      }
    } catch (paymentsError) {
      console.warn('Could not fetch payments:', paymentsError);
      // Continue with default values
    }

    // Calculate platform profit (commission - GST is already deducted from gross)
    const platformProfit = totalPlatformCommission;

    // Calculate platform profit (commission - GST is already deducted from gross)
    const platformProfit = totalPlatformCommission;

    return NextResponse.json({
      totalBooks: totalBooks || 0,
      totalAudioBooks: totalAudioBooks || 0,
      totalAuthors: totalAuthors || 0,
      totalUsers: totalUsers || 0,
      totalRevenue,
      totalPayments,
      totalPlatformCommission,
      totalGST,
      totalAuthorEarnings,
      platformProfit,
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


