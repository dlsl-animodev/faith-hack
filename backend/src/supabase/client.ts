import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.'
  );
}

/**
 * Supabase client initialised with the service-role key.
 * NEVER expose this client or key to the frontend.
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Service role does not need session persistence
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
