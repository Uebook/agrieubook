import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/curriculum - Get curriculum list with optional state filter
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    // Default to 'active' for security - only show active curriculums unless explicitly requested
    // Admin panel can pass status='all' to see all curriculums
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    console.log('📚 GET /api/curriculum - Filters:', {
      state,
      status,
      page,
      limit,
    });

    let query = supabase
      .from('curriculum')
      .select('*', { count: 'exact' })
      .order('published_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    // Apply status filter only if specified (not 'all')
    if (status && status !== 'all') {
      query = query.eq('status', status);
      console.log('📚 Applied status filter:', status);
    }

    // Filter by state if provided
    if (state) {
      query = query.eq('state', state);
      console.log('📚 Applied state filter:', state);
    }

    const { data: curriculums, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching curriculum:', error);
      return NextResponse.json(
        { error: 'Failed to fetch curriculum', details: error.message },
        { status: 500 }
      );
    }

    console.log('📚 GET /api/curriculum - Results:', {
      curriculumsCount: curriculums?.length || 0,
      totalCount: count || 0,
      hasError: !!error,
    });

    return NextResponse.json({
      curriculums: curriculums || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/curriculum:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/curriculum - Create new curriculum entry
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const {
      title,
      description,
      state,
      state_name,
      language,
      banner_url,
      pdf_url,
      cover_image_url,
      published_date,
      scheme_name,
      grade,
      subject,
      status = 'active',
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Build insert data object, only including fields that are provided
    const insertData: any = {
      title,
      description: description || null,
      state: state || null,
      state_name: state_name || null,
      language: language || 'English',
      banner_url: banner_url || null,
      pdf_url: pdf_url || null,
      published_date: published_date || new Date().toISOString().split('T')[0], // Convert to DATE format
      status: status || 'active',
    };
    
    // Add optional fields only if provided
    if (scheme_name) insertData.scheme_name = scheme_name;
    if (grade) insertData.grade = grade;
    if (subject) insertData.subject = subject;
    // Note: cover_image_url is not in the schema, use banner_url instead
    
    console.log('Inserting curriculum data:', insertData);
    
    const { data: curriculum, error } = await supabase
      .from('curriculum')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating curriculum:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create curriculum';
      if (error.code === '42P01') {
        errorMessage = 'Curriculum table does not exist. Please create the table in Supabase.';
      } else if (error.code === '42703') {
        errorMessage = `Database column error: ${error.message}. Please check the curriculum table schema.`;
      } else if (error.message) {
        errorMessage = `Failed to create curriculum: ${error.message}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ curriculum }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/curriculum:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

