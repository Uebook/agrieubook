/**
 * Supabase Client Configuration for Mobile App
 * 
 * Credentials are configured below.
 * To update: Get values from Supabase Dashboard → Settings → API
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Configuration - Already configured ✅
// Same credentials as used in admin/.env.local
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

// Log validation results (wrapped in try-catch to avoid Metro issues)
try {
  if (__DEV__) {
    console.log('🔍 Supabase validation:', {
      hasValidUrl,
      hasValidKey,
      url: SUPABASE_URL?.substring(0, 30) + '...',
      keyLength: SUPABASE_ANON_KEY?.length,
    });
  }
} catch (e) {
  // Ignore logging errors
}

if (hasValidUrl && hasValidKey) {
  try {
    // Use same pattern as backend: createClient with auth options
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    // Verify client was created
    if (client && typeof client === 'object') {
      supabase = client;
      try {
        if (__DEV__) {
          console.log('✅ Supabase client created successfully');
        }
      } catch (e) {}
    } else {
      if (__DEV__) {
        console.error('❌ createClient returned invalid value:', typeof client, client);
      }
      supabase = null;
    }
  } catch (error) {
    supabase = null;
    try {
      if (__DEV__) {
        console.error('❌ Failed to create Supabase client:', error?.message || String(error));
      }
    } catch (e) {}
  }
} else {
  try {
    if (__DEV__) {
      console.error('❌ Supabase validation failed:', {
        hasValidUrl,
        hasValidKey,
      });
    }
  } catch (e) {}
}

export default supabase;
