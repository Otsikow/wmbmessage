const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const ACTIVE_SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && ACTIVE_SUPABASE_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are not configured. Data features will be disabled until VITE_SUPABASE_URL and either VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY are provided.'
  );
}

export const supabaseCredentials = {
  url: SUPABASE_URL || 'https://placeholder.supabase.co',
  key: ACTIVE_SUPABASE_KEY || 'public-anon-key',
};

