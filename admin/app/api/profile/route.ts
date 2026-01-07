import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/profile - Get admin profile
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get admin user from auth or use a default admin user ID
    // Try to get the first admin user, or any user if no admin exists
    let { data: adminUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle();
    
    // If no admin user found, try to get any user (for development)
    if (!adminUser && error?.code === 'PGRST116') {
      const { data: anyUser } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (anyUser) {
        adminUser = anyUser;
      }
    }
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching admin profile:', error);
    }
    
    // If admin user exists, return it; otherwise return default
    if (adminUser) {
      return NextResponse.json({
        profile: {
          ...adminUser,
          role: adminUser.role || 'Super Admin',
          join_date: adminUser.created_at || adminUser.join_date || new Date().toISOString(),
          last_login: adminUser.last_login || new Date().toISOString(),
        },
      });
    }
    
    // Return default admin profile
    return NextResponse.json({
      profile: {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@agribook.com',
        role: 'Super Admin',
        join_date: new Date().toISOString(),
        last_login: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update admin profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    const { name, email, current_password, new_password } = body;
    
    // Get admin user ID (in real app, get from auth session)
    // Try to get admin user first, then fallback to any user
    let { data: adminUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle();
    
    // If no admin user found, try to get any user (for development)
    if (!adminUser && findError?.code === 'PGRST116') {
      const { data: anyUser } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (anyUser) {
        adminUser = anyUser;
      }
    }
    
    // If still no user found, create a default admin user
    if (!adminUser) {
      console.log('No admin user found, creating default admin user');
      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          name: 'Admin User',
          email: 'admin@agribook.com',
          role: 'admin',
        })
        .select('id')
        .single();
      
      if (createError || !newAdmin) {
        console.error('Error creating admin user:', createError);
        return NextResponse.json(
          { 
            error: 'Admin user not found and could not be created',
            details: createError?.message || 'Please create an admin user in the database',
          },
          { status: 404 }
        );
      }
      
      adminUser = newAdmin;
    }
    
    // Update profile
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (new_password && current_password) {
      // In real app, verify current_password and hash new_password
      // For now, just update (you should implement proper password hashing)
      updateData.password = new_password; // This should be hashed!
    }
    
    console.log('Updating profile with data:', { id: adminUser.id, updateData });
    
    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', adminUser.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to update profile', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
