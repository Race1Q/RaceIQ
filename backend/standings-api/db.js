// db.js
require('dotenv').config();
const { Pool } = require('pg');

function buildPoolConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing');
  }

  // Force SSL when connecting to Supabase hosts
  let ssl = false;
  try {
    const u = new URL(connectionString);
    const host = u.hostname || '';
    const isSupabase = host.includes('supabase.com');
    ssl = isSupabase ? { rejectUnauthorized: false } : (process.env.DB_SSL === 'true');
  } catch {
    ssl = process.env.DB_SSL === 'true';
  }

  return { connectionString, ssl };
}

const pool = new Pool(buildPoolConfig());

pool.on('connect', () => {
  console.log('🗄️  Database pool created successfully');
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };