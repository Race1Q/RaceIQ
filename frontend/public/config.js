// Azure Static Web Apps environment variable injection
// These placeholders will be replaced by Azure at runtime
window.VITE_SUPABASE_URL = '{{VITE_SUPABASE_URL}}';
window.VITE_SUPABASE_ANON_KEY = '{{VITE_SUPABASE_ANON_KEY}}';
window.VITE_AUTH0_DOMAIN = '{{VITE_AUTH0_DOMAIN}}';
window.VITE_AUTH0_CLIENT_ID = '{{VITE_AUTH0_CLIENT_ID}}';
window.VITE_AUTH0_AUDIENCE = '{{VITE_AUTH0_AUDIENCE}}';

// Debug logging to help troubleshoot
console.log('Config loaded:', {
  supabaseUrl: window.VITE_SUPABASE_URL,
  supabaseKey: window.VITE_SUPABASE_ANON_KEY ? '***' : 'MISSING',
  auth0Domain: window.VITE_AUTH0_DOMAIN,
  auth0ClientId: window.VITE_AUTH0_CLIENT_ID ? '***' : 'MISSING',
  auth0Audience: window.VITE_AUTH0_AUDIENCE
});
