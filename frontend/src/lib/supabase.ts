import { createClient } from '@supabase/supabase-js';

// Azure Static Web Apps environment variables are available at runtime
// We need to handle both build-time (local dev) and runtime (Azure) scenarios
const getSupabaseConfig = () => {
  // For local development, use import.meta.env
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.log('Using build-time environment variables');
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }
  
  // For Azure Static Web Apps, environment variables are injected at runtime
  // We need to access them through a different method
  const url = (window as any).VITE_SUPABASE_URL;
  const key = (window as any).VITE_SUPABASE_ANON_KEY;
  
  console.log('Runtime environment variables:', {
    url: url || 'MISSING',
    key: key ? '***' : 'MISSING',
    windowKeys: Object.keys(window).filter(k => k.startsWith('VITE_'))
  });
  
  if (!url) {
    throw new Error('VITE_SUPABASE_URL is required but not found. Check Azure Static Web Apps environment variables.');
  }
  
  if (!key) {
    throw new Error('VITE_SUPABASE_ANON_KEY is required but not found. Check Azure Static Web Apps environment variables.');
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    throw new Error(`Invalid VITE_SUPABASE_URL: "${url}". Must be a valid URL.`);
  }
  
  return { url, key };
};

const config = getSupabaseConfig();
export const supabase = createClient(config.url, config.key);
