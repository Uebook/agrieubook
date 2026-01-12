/**
 * Supabase Client Configuration for Mobile App
 * 
 * Credentials are configured below.
 * To update: Get values from Supabase Dashboard → Settings → API
 */

import { createClient } from '@supabase/supabase-js';

console.log('📦 Supabase module loading...');

// Supabase Configuration - Already configured ✅
// Same credentials as used in admin/.env.local
const SUPABASE_URL = 'https://isndoxsyjbdzibhkrisj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODg4NTEsImV4cCI6MjA4MzE2NDg1MX0.xAhUBZ-5NCySy6QmF0DheBZaeFZRBBtnHRDHYcpQglo';

console.log('📦 Supabase credentials loaded:', {
  url: SUPABASE_URL,
  keyLength: SUPABASE_ANON_KEY?.length,
  hasUrl: !!SUPABASE_URL,
  hasKey: !!SUPABASE_ANON_KEY,
});

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

console.log('🔍 Validation check:', {
  hasValidUrl,
  hasValidKey,
  url: SUPABASE_URL,
  urlCheck: SUPABASE_URL !== PLACEHOLDER_URL,
  urlStartsWithHttps: SUPABASE_URL?.startsWith('https://'),
  keyLength: SUPABASE_ANON_KEY?.length,
  keyCheck: SUPABASE_ANON_KEY !== PLACEHOLDER_KEY,
});

if (hasValidUrl && hasValidKey) {
  console.log('✅ Validation passed, creating client...');
  
  try {
    console.log('🔧 Creating Supabase client (matching backend pattern)...');
    
    // Use same pattern as backend: createClient with auth options
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('🔧 createClient returned:', {
      isNull: supabase === null,
      isUndefined: supabase === undefined,
      type: typeof supabase,
      hasStorage: supabase ? !!supabase.storage : false,
      hasAuth: supabase ? !!supabase.auth : false,
    });

    // Verify client was created
    if (supabase) {
      console.log('✅ Supabase client initialized successfully');
      console.log('✅ Client type:', typeof supabase);
      console.log('✅ Client has storage:', !!supabase.storage);
      console.log('✅ Client has auth:', !!supabase.auth);
    } else {
      console.error('❌ Supabase client is null after createClient call');
    }
  } catch (error) {
    console.error('❌ CRITICAL: Exception during createClient:', error);
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.substring(0, 500),
    });
    supabase = null;
  }
} else {
  console.error('❌ CRITICAL: Validation failed - credentials are invalid:', {
    hasValidUrl,
    hasValidKey,
    url: SUPABASE_URL,
    keyLength: SUPABASE_ANON_KEY?.length,
  });
}

// Final verification
console.log('📊 Final module state:', {
  supabaseIsNull: supabase === null,
  supabaseIsUndefined: supabase === undefined,
  supabaseType: typeof supabase,
  supabaseValue: supabase,
});

if (!supabase) {
  console.error('❌ CRITICAL: Supabase client is NULL - profile image uploads will fail!');
  console.error('❌ This means createClient() returned null or threw an error');
} else {
  console.log('✅ Supabase client is ready for use');
  console.log('✅ Exporting supabase client');
}

export default supabase;
