require('dotenv').config();
const { Pool } = require('pg');

(async () => {
  try {
    console.log('DATABASE_URL =', JSON.stringify(process.env.DATABASE_URL));
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    const r = await pool.query('select current_user, inet_server_addr() host, inet_server_port() port;');
    console.log('OK:', r.rows[0]);
    await pool.end();
  } catch (e) {
    console.error('CONNECT ERROR:', e.message);
    console.error(e);
  }
})();
