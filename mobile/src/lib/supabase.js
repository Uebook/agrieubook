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

// Always try to create Supabase client - fail gracefully if it doesn't work
let supabase = null;

// Validate that we have real credentials (not placeholders)
const PLACEHOLDER_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const PLACEHOLDER_KEY = 'YOUR_PUBLIC_ANON_KEY';

const hasValidUrl = SUPABASE_URL &&
  SUPABASE_URL !== PLACEHOLDER_URL &&
  SUPABASE_URL.startsWith('https://');

const hasValidKey = SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY !== PLACEHOLDER_KEY &&
  SUPABASE_ANON_KEY.length > 50;

console.log('🔍 Supabase Config Check:', {
  hasValidUrl,
  hasValidKey,
  url: SUPABASE_URL?.substring(0, 40) + '...',
  keyLength: SUPABASE_ANON_KEY?.length,
  urlValue: SUPABASE_URL,
  keyValue: SUPABASE_ANON_KEY?.substring(0, 20) + '...',
});

if (hasValidUrl && hasValidKey) {
  try {
    console.log('🔧 Creating Supabase client...');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created successfully');
    console.log('✅ Supabase client object:', !!supabase, typeof supabase);
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    supabase = null;
  }
} else {
  console.warn('⚠️ Supabase credentials validation failed:', {
    hasValidUrl,
    hasValidKey,
    urlCheck: SUPABASE_URL !== PLACEHOLDER_URL,
    urlStartsWithHttps: SUPABASE_URL?.startsWith('https://'),
    keyCheck: SUPABASE_ANON_KEY !== PLACEHOLDER_KEY,
    keyLength: SUPABASE_ANON_KEY?.length,
  });
}

// Log final state
console.log('📊 Final Supabase state:', {
  supabaseIsNull: supabase === null,
  supabaseExists: !!supabase,
  supabaseType: typeof supabase,
});

export default supabase;
