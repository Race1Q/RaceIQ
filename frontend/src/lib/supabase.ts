import { createClient } from '@supabase/supabase-js';

// Azure Static Web Apps environment variables are available at runtime
// We need to handle both build-time (local dev) and runtime (Azure) scenarios
const getSupabaseConfig = () => {
  // For local development, use import.meta.env
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }
  
  // For Azure Static Web Apps, environment variables are injected at runtime
  // We need to access them through a different method
  const url = (window as any).VITE_SUPABASE_URL;
  const key = (window as any).VITE_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('Supabase environment variables not found:', { url: !!url, key: !!key });
    throw new Error('Supabase configuration is required. Please check environment variables.');
  }
  
  return { url, key };
};

const config = getSupabaseConfig();
export const supabase = createClient(config.url, config.key);
