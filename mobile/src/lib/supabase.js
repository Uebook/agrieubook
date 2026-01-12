/**
 * Supabase Client Configuration for Mobile App
 * 
 * IMPORTANT: Replace these values with your actual Supabase credentials
 * You can find them in Supabase Dashboard → Settings → API
 * 
 * Or copy from admin/.env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase credentials
// Get these from: Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://isndoxsyjbdzibhkrisj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODg4NTEsImV4cCI6MjA4MzE2NDg1MX0.xAhUBZ-5NCySy6QmF0DheBZaeFZRBBtnHRDHYcpQglo';

// Validate configuration
const isValidConfig = SUPABASE_URL && 
                      SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' &&
                      SUPABASE_URL.startsWith('https://') &&
                      SUPABASE_ANON_KEY && 
                      SUPABASE_ANON_KEY !== 'YOUR_PUBLIC_ANON_KEY' &&
                      SUPABASE_ANON_KEY.length > 50;

// Create Supabase client only if configuration is valid
let supabase = null;

if (isValidConfig) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
    supabase = null;
  }
} else {
  console.warn('⚠️ Supabase not configured. Please update SUPABASE_URL and SUPABASE_ANON_KEY in mobile/src/lib/supabase.js');
}

export default supabase;
