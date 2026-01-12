/**
 * Supabase Client Configuration for Mobile App
 * 
 * IMPORTANT: Replace these values with your actual Supabase credentials
 * You can find them in Supabase Dashboard → Settings → API
 */

import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase credentials
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
