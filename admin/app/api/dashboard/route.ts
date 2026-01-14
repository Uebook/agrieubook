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
      const { data: payments, error: paymentsError, count: totalPaymentsCount } = await supabase
        .from('payments')
        .select('amount, status, book_id, audio_book_id, created_at, platform_commission, gst_amount, author_earnings', { count: 'exact', head: false })
        .limit(1);
      
      // Debug: Get total count of all payments (any status)
      const { count: allPaymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });
      
      console.log('📊 Total payments in database (any status):', allPaymentsCount || 0);
      
      // If table doesn't exist (PGRST116) or no error, try to fetch all payments
      if (paymentsError && paymentsError.code === 'PGRST116') {
        // Table doesn't exist, use defaults
        console.log('❌ Payments table not found, using default values');
      } else if (!paymentsError) {
        // Table exists, fetch book/audio book payments (EXACT same query pattern as purchases API)
        // Match the purchases API EXACTLY - same query, same filters
        let paymentsQuery = supabase
          .from('payments')
          .select('amount, status, book_id, audio_book_id, created_at, platform_commission, gst_amount, author_earnings, subscription_type_id, author_id')
          .eq('status', 'completed') // Only completed payments (same as purchases API)
          .is('subscription_type_id', null); // Exclude subscription purchases (same as purchases API)
        
        // Apply date filtering if provided
        if (startDate) {
          paymentsQuery = paymentsQuery.gte('created_at', startDate);
        }
        if (endDate) {
          // Add one day to endDate to include the entire end date
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          paymentsQuery = paymentsQuery.lt('created_at', endDatePlusOne.toISOString());
        }
        
        // Execute query - EXACT same as purchases API
        const { data: allPayments, error: paymentsFetchError } = await paymentsQuery;
        
        if (paymentsFetchError) {
          console.error('❌ Error fetching payments:', paymentsFetchError);
          console.error('Error details:', JSON.stringify(paymentsFetchError, null, 2));
        } else {
          console.log('✅ Payments query successful');
        }
        
        console.log('📊 Dashboard API - All payments fetched:', allPayments?.length || 0);
        
        // Filter payments - EXACT same logic as purchases API
        // Purchases API filters in JavaScript: payments with book_id OR audio_book_id
        // This matches what shows on the Purchases page
        const bookPayments = (allPayments || []).filter(p => {
          return p.book_id || p.audio_book_id; // Must have book_id OR audio_book_id
        });
        
        console.log('📊 Total payments from query:', allPayments?.length || 0);
        console.log('📊 Payments with book_id or audio_book_id:', bookPayments.length);
        
        if (allPayments && allPayments.length > 0) {
          console.log('📊 Sample payment from query:', JSON.stringify(allPayments[0], null, 2));
          console.log('📊 Payment breakdown:', {
            total: allPayments.length,
            withBookId: allPayments.filter(p => p.book_id).length,
            withAudioBookId: allPayments.filter(p => p.audio_book_id).length,
            withBookOrAudioBook: bookPayments.length,
            withAmountGreaterThanZero: allPayments.filter(p => parseFloat(String(p.amount || 0)) > 0).length,
            sampleAmounts: allPayments.slice(0, 3).map(p => ({ 
              amount: p.amount, 
              book_id: p.book_id, 
              audio_book_id: p.audio_book_id,
              status: p.status,
              subscription_type_id: p.subscription_type_id
            }))
          });
        }
        
        if (bookPayments.length > 0) {
          console.log('✅ Found book payments:', bookPayments.length);
          console.log('📊 Sample book payment:', JSON.stringify(bookPayments[0], null, 2));
        } else {
          console.log('⚠️ No book payments found after filtering');
          if (allPayments && allPayments.length > 0) {
            console.log('⚠️ But payments exist! Check if they have book_id or audio_book_id');
            console.log('📊 All payments sample:', JSON.stringify(allPayments.slice(0, 3), null, 2));
          }
        }
        
        if (bookPayments && bookPayments.length > 0) {
          
          totalPayments = bookPayments.length;
          // Calculate totals - only include payments with amount > 0 for revenue
          const revenuePayments = bookPayments.filter(p => parseFloat(String(p.amount || 0)) > 0);
          totalRevenue = revenuePayments.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);
          
          // Calculate commission/GST - use stored values or calculate on the fly
          // Only process payments with amount > 0 for revenue calculations
          for (const payment of bookPayments.filter(p => parseFloat(String(p.amount || 0)) > 0)) {
            const amount = parseFloat(String(payment.amount)) || 0;
            
            // If commission fields are missing, calculate them
            let gstAmount = parseFloat(String(payment.gst_amount)) || 0;
            let platformCommission = parseFloat(String(payment.platform_commission)) || 0;
            let authorEarnings = parseFloat(String(payment.author_earnings)) || 0;
            
            // Only calculate if amount > 0 and fields are missing
            if (amount > 0 && (gstAmount === 0 || platformCommission === 0 || authorEarnings === 0)) {
              // GST calculation: 18% of gross amount
              gstAmount = parseFloat((amount * 0.18).toFixed(2));
              // Net amount after GST
              const netAmount = parseFloat((amount - gstAmount).toFixed(2));
              // Platform commission: 30% of net amount
              platformCommission = parseFloat((netAmount * 0.30).toFixed(2));
              // Author earnings: 70% of net amount
              authorEarnings = parseFloat((netAmount * 0.70).toFixed(2));
            }
            
            totalPlatformCommission += platformCommission;
            totalGST += gstAmount;
            totalAuthorEarnings += authorEarnings;
          }
          
          console.log('📊 Calculated totals:', {
            totalRevenue,
            totalPlatformCommission,
            totalGST,
            totalAuthorEarnings,
            totalPayments: bookPayments.length
          });
          
          // Calculate author revenue (group by author) - use author_earnings from payments
          // Only process payments with amount > 0
          const authorRevenueMap = new Map();
          for (const payment of bookPayments.filter(p => parseFloat(String(p.amount || 0)) > 0)) {
            const amount = parseFloat(String(payment.amount)) || 0;
            if (amount > 0) {
              // Calculate author earnings (use stored value or calculate)
              let authorEarnings = parseFloat(String(payment.author_earnings)) || 0;
              if (authorEarnings === 0 && amount > 0) {
                // Calculate on the fly if missing
                const gstAmount = parseFloat((amount * 0.18).toFixed(2));
                const netAmount = parseFloat((amount - gstAmount).toFixed(2));
                authorEarnings = parseFloat((netAmount * 0.70).toFixed(2));
              }
              
              if (authorEarnings > 0) {
                // Get author_id from payment or from book/audio_book
                let authorId = payment.author_id || null;
                if (!authorId) {
                  if (payment.book_id) {
                    const { data: book } = await supabase
                      .from('books')
                      .select('author_id')
                      .eq('id', payment.book_id)
                      .single();
                    authorId = book?.author_id;
                  } else if (payment.audio_book_id) {
                    const { data: audioBook } = await supabase
                      .from('audio_books')
                      .select('author_id')
                      .eq('id', payment.audio_book_id)
                      .single();
                    authorId = audioBook?.author_id;
                  }
                }
                
                if (authorId) {
                  const current = authorRevenueMap.get(authorId) || 0;
                  authorRevenueMap.set(authorId, current + authorEarnings);
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


