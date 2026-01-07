import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/settings - Get platform settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get settings from database (assuming a settings table exists)
    // If table doesn't exist, return default settings
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching settings:', error);
      // Return default settings if table doesn't exist
      return NextResponse.json({
        settings: {
          platform_name: 'Agribook',
          support_email: 'support@agribook.com',
          auto_approve_books: false,
          email_notifications: true,
        },
      });
    }
    
    // If settings exist, return them; otherwise return defaults
    if (settings) {
      return NextResponse.json({ settings });
    }
    
    return NextResponse.json({
      settings: {
        platform_name: 'Agribook',
        support_email: 'support@agribook.com',
        auto_approve_books: false,
        email_notifications: true,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update platform settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    const {
      platform_name,
      support_email,
      auto_approve_books,
      email_notifications,
    } = body;
    
    // Check if settings record exists
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .single();
    
    // If table doesn't exist, return helpful error
    if (checkError && checkError.code === '42P01') {
      console.error('Settings table does not exist. Please create it in Supabase.');
      return NextResponse.json(
        { 
          error: 'Settings table not found', 
          details: 'Please create the settings table in your Supabase database. See database/create_settings_table.sql for the schema.',
        },
        { status: 500 }
      );
    }
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (platform_name !== undefined) updateData.platform_name = platform_name;
      if (support_email !== undefined) updateData.support_email = support_email;
      if (auto_approve_books !== undefined) updateData.auto_approve_books = auto_approve_books;
      if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
      
      const { data, error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating settings:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Provide more specific error messages
        let errorMessage = 'Failed to update settings';
        if (error.code === '42P01') {
          errorMessage = 'Settings table does not exist. Please run the SQL migration: database/create_settings_table.sql';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return NextResponse.json(
          { error: errorMessage, details: error.message, code: error.code },
          { status: 500 }
        );
      }
      
      result = data;
    } else {
      // Create new settings record
      const { data, error } = await supabase
        .from('settings')
        .insert({
          platform_name: platform_name || 'Agribook',
          support_email: support_email || 'support@agribook.com',
          auto_approve_books: auto_approve_books || false,
          email_notifications: email_notifications !== undefined ? email_notifications : true,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating settings:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Provide more specific error messages
        let errorMessage = 'Failed to create settings';
        if (error.code === '42P01') {
          errorMessage = 'Settings table does not exist. Please run the SQL migration: database/create_settings_table.sql';
        } else if (error.code === '23505') {
          errorMessage = 'Settings record already exists';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return NextResponse.json(
          { error: errorMessage, details: error.message, code: error.code },
          { status: 500 }
        );
      }
      
      result = data;
    }
    
    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
