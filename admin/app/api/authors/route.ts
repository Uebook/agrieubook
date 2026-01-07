import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/authors - List authors with pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Fetch publishers/authors from users table (role = 'publisher' or 'author')
    // Also include data from authors table if it exists
    // Try to fetch with 'publisher' first, then fallback to 'author'
    let publisherUsers: any[] = [];
    let usersError: any = null;
    
    // Try 'publisher' role
    const { data: publisherData, error: publisherError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'publisher')
      .order('created_at', { ascending: false });
    
    if (!publisherError && publisherData) {
      publisherUsers = publisherData;
    }
    
    // Also try 'author' role
    const { data: authorData, error: authorError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'author')
      .order('created_at', { ascending: false });
    
    if (!authorError && authorData) {
      // Combine both, avoiding duplicates
      const existingIds = new Set(publisherUsers.map((u: any) => u.id));
      authorData.forEach((user: any) => {
        if (!existingIds.has(user.id)) {
          publisherUsers.push(user);
        }
      });
    }
    
    if (publisherError && authorError) {
      usersError = publisherError || authorError;
    }
    
    if (usersError) {
      console.error('Error fetching publisher users:', usersError);
    }
    
    // Also fetch from authors table (for backward compatibility)
    const { data: authorsTable, error: authorsError } = await supabase
      .from('authors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (authorsError) {
      console.error('Error fetching authors table:', authorsError);
    }
    
    // Combine and deduplicate authors
    const allAuthors: any[] = [];
    const authorMap = new Map();
    
    // Add authors from users table (publishers)
    if (publisherUsers) {
      publisherUsers.forEach((user: any) => {
        // Get book counts for this author
        const authorData = {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          bio: user.bio || user.description || '',
          avatar_url: user.avatar_url,
          status: user.status || 'active',
          role: user.role,
          created_at: user.created_at,
          // We'll add book counts below
        };
        authorMap.set(user.id, authorData);
      });
    }
    
    // Add authors from authors table (merge with users if same ID)
    if (authorsTable) {
      authorsTable.forEach((author: any) => {
        if (authorMap.has(author.id)) {
          // Merge data from authors table
          const existing = authorMap.get(author.id);
          authorMap.set(author.id, { ...existing, ...author });
        } else {
          authorMap.set(author.id, author);
        }
      });
    }
    
    // Get book counts for each author
    const authorIds = Array.from(authorMap.keys());
    let bookCounts: any[] = [];
    let audioBookCounts: any[] = [];
    
    if (authorIds.length > 0) {
      const { data: bookCountsData } = await supabase
        .from('books')
        .select('author_id')
        .in('author_id', authorIds);
      
      const { data: audioBookCountsData } = await supabase
        .from('audio_books')
        .select('author_id')
        .in('author_id', authorIds);
      
      bookCounts = bookCountsData || [];
      audioBookCounts = audioBookCountsData || [];
    }
    
    // Count books per author
    const booksCountMap = new Map();
    if (bookCounts) {
      bookCounts.forEach((book: any) => {
        const count = booksCountMap.get(book.author_id) || 0;
        booksCountMap.set(book.author_id, count + 1);
      });
    }
    
    const audioBooksCountMap = new Map();
    if (audioBookCounts) {
      audioBookCounts.forEach((audioBook: any) => {
        const count = audioBooksCountMap.get(audioBook.author_id) || 0;
        audioBooksCountMap.set(audioBook.author_id, count + 1);
      });
    }
    
    // Add counts to authors
    authorMap.forEach((author, id) => {
      author.books_count = booksCountMap.get(id) || 0;
      author.audio_books_count = audioBooksCountMap.get(id) || 0;
      allAuthors.push(author);
    });
    
    // Sort by created_at
    allAuthors.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    // Apply pagination
    const paginatedAuthors = allAuthors.slice(offset, offset + limit);
    const totalCount = allAuthors.length;
    
    if (usersError && authorsError) {
      return NextResponse.json(
        { error: 'Failed to fetch authors' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      authors: paginatedAuthors || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/authors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/authors - Create new author
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    const { name, email, mobile, bio, avatar_url, status } = body;
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { data: author, error } = await supabase
      .from('authors')
      .insert({
        name,
        email,
        mobile,
        bio,
        avatar_url,
        status: status || 'active',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating author:', error);
      return NextResponse.json(
        { error: 'Failed to create author' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ author }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/authors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


