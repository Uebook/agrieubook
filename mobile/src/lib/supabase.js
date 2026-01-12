/**
 * Supabase Client Configuration for Mobile App
 * 
 * Credentials are configured below.
 * To update: Get values from Supabase Dashboard → Settings → API
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Configuration - Already configured ✅
const SUPABASE_URL = 'https://isndoxsyjbdzibhkrisj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODg4NTEsImV4cCI6MjA4MzE2NDg1MX0.xAhUBZ-5NCySy6QmF0DheBZaeFZRBBtnHRDHYcpQglo';

// Validate credentials
const PLACEHOLDER_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const PLACEHOLDER_KEY = 'YOUR_PUBLIC_ANON_KEY';

const hasValidUrl = SUPABASE_URL &&
  SUPABASE_URL !== PLACEHOLDER_URL &&
  SUPABASE_URL.startsWith('https://');

const hasValidKey = SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY !== PLACEHOLDER_KEY &&
  SUPABASE_ANON_KEY.length > 50;

// Create Supabase client - always create if credentials are valid
let supabase = null;

if (hasValidUrl && hasValidKey) {
  try {
    console.log('🔧 Initializing Supabase client with:', {
      url: SUPABASE_URL,
      keyLength: SUPABASE_ANON_KEY.length,
    });
    
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Verify client was created
    if (supabase) {
      console.log('✅ Supabase client initialized successfully');
      console.log('✅ Client type:', typeof supabase);
      console.log('✅ Client has storage:', !!supabase.storage);
    } else {
      console.error('❌ Supabase client is null after creation');
    }
  } catch (error) {
    console.error('❌ CRITICAL: Failed to create Supabase client:', error);
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.substring(0, 200),
    });
    supabase = null;
  }
} else {
  console.error('❌ CRITICAL: Supabase credentials are invalid:', {
    hasValidUrl,
    hasValidKey,
    url: SUPABASE_URL,
    keyLength: SUPABASE_ANON_KEY?.length,
  });
}

// Final verification
if (!supabase) {
  console.error('❌ CRITICAL: Supabase client is NULL - profile image uploads will fail!');
} else {
  console.log('✅ Supabase client is ready for use');
}

export default supabase;
