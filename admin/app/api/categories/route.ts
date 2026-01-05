import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

