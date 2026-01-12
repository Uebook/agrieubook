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

// Create Supabase client - same pattern as backend
// Backend uses: createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
