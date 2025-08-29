require('dotenv').config();
const { Pool } = require('pg');

// Use the correct Supabase pooled connection format
const connectionString = 'postgresql://postgres.jqbyjspsgwkgyavuphcm:iykRM4MdDcKeBkrT@aws-1-eu-west-2.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const r = await pool.query('select current_user, inet_server_addr() host, inet_server_port() port;');
    console.log('OK:', r.rows[0]);
  } catch (e) {
    console.error('CONNECT ERROR:', e.message);
    console.error('Connection string used:', connectionString.replace(/:[^:@]*@/, ':****@')); // Hide password
  } finally {
    await pool.end();
  }
})();
