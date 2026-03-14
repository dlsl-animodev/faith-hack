import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Supabase browser client using the ANON key.
 * Used ONLY for Realtime subscriptions on the admin page.
 * Never used for data mutations — those go through the Express backend.
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
