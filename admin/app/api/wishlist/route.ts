import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: wishlist, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        book:books(
          id,
          title,
          summary,
          cover_image_url,
          price,
          rating,
          reviews_count,
          is_free,
          author:authors(id, name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wishlist' },
        { status: 500 }
      );
    }

    const books = wishlist?.map((item) => ({
      id: item.book?.id,
      title: item.book?.title,
      cover: item.book?.cover_image_url,
      author: {
        name: item.book?.author?.name || 'Unknown',
      },
      price: parseFloat(item.book?.price?.toString() || '0'),
      rating: parseFloat(item.book?.rating?.toString() || '0'),
      reviews: item.book?.reviews_count || 0,
      isFree: item.book?.is_free || false,
    })) || [];

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error in GET /api/wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add book to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, book_id } = body;

    if (!user_id || !book_id) {
      return NextResponse.json(
        { error: 'user_id and book_id are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id,
        book_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - already in wishlist
        return NextResponse.json(
          { success: true, message: 'Book already in wishlist' },
          { status: 200 }
        );
      }
      console.error('Error adding to wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to add to wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Book added to wishlist',
      data,
    });
  } catch (error) {
    console.error('Error in POST /api/wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove book from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const bookId = searchParams.get('book_id');

    if (!userId || !bookId) {
      return NextResponse.json(
        { error: 'user_id and book_id are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to remove from wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Book removed from wishlist',
    });
  } catch (error) {
    console.error('Error in DELETE /api/wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

