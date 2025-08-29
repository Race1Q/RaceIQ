import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// If you're on Node < 18, install node-fetch and uncomment:
// // @ts-ignore
// import fetch from 'node-fetch';

/* ---------- Load .env (supports .env and .env.back in common spots) ---------- */
const ENV_CANDIDATES = [
  path.resolve(process.cwd(), '.env'),           // backend/.env (preferred)
  path.resolve(process.cwd(), '.env.back'),      // backend/.env.back (your file)
  path.resolve(__dirname, '../.env'),            // repoRoot/.env
  path.resolve(__dirname, '../.env.back'),       // repoRoot/.env.back
  path.resolve(process.cwd(), '../.env'),        // parent/.env
  path.resolve(process.cwd(), '../.env.back'),   // parent/.env.back
];

const ENV_PATH = ENV_CANDIDATES.find((p) => fs.existsSync(p));
console.log('Loading .env from:', ENV_PATH ?? 'NOT FOUND');
if (ENV_PATH) dotenv.config({ path: ENV_PATH });

/* --------------------------- Read + normalize envs --------------------------- */
const RAW = process.env as Record<string, string | undefined>;

// Allow AUTH0_DOMAIN or derive from AUTH0_ISSUER_URL
const AUTH0_DOMAIN =
  RAW.AUTH0_DOMAIN ||
  (RAW.AUTH0_ISSUER_URL ? new URL(RAW.AUTH0_ISSUER_URL).host : undefined);

// Accept AUTH0_CLIENT_ID or (typo) Auth0_CLIENT_ID
const AUTH0_CLIENT_ID = RAW.AUTH0_CLIENT_ID || (RAW as any).Auth0_CLIENT_ID;

// Trim secret (guard against stray spaces)
const AUTH0_CLIENT_SECRET = RAW.AUTH0_CLIENT_SECRET?.trim();

// Supabase keys (accept SERVICE_ROLE or SERVICE_ROLE_KEY)
const SUPABASE_URL = RAW.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = RAW.SUPABASE_SERVICE_ROLE || RAW.SUPABASE_SERVICE_ROLE_KEY;

// Helpful debug (comment out later)
if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error({
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET_present: !!AUTH0_CLIENT_SECRET,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_present: !!SUPABASE_SERVICE_ROLE,
  });
  throw new Error(
    'Missing required env vars: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE'
  );
}

/* ------------------------------- Supabase client ---------------------------- */
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

/* -------------------------- Auth0 helper: get token ------------------------- */
async function getMgmtToken(): Promise<string> {
  const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });
  if (!res.ok) throw new Error(`Token error: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

/* ------------------------------ Fetch all users ----------------------------- */
type Auth0User = { user_id: string; name?: string | null; nickname?: string | null };

async function fetchAllAuth0Users(token: string): Promise<Auth0User[]> {
  const all: Auth0User[] = [];
  let page = 0;
  const per_page = 100;

  for (;;) {
    const url = new URL(`https://${AUTH0_DOMAIN}/api/v2/users`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(per_page));
    url.searchParams.set('include_totals', 'true');
    url.searchParams.set('fields', 'user_id,name,nickname'); // reduce payload
    url.searchParams.set('include_fields', 'true');

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Users fetch error: ${res.status} ${await res.text()}`);

    const data = (await res.json()) as any;
    const users: Auth0User[] = Array.isArray(data) ? data : data.users ?? [];
    if (users.length === 0) break;

    all.push(...users);
    if (users.length < per_page) break;
    page += 1;
  }
  return all;
}

/* --------------------------- Map → Supabase rows ---------------------------- */
type UsersRow = { auth0_sub: string; full_name: string | null; username: string | null };

function mapRows(auth0Users: Auth0User[]): UsersRow[] {
  return auth0Users.map((u) => ({
    auth0_sub: u.user_id,
    full_name: u.name ?? null,
    username: u.nickname ?? null,
  }));
}

/* ----------------------- Upsert with collision handling --------------------- */
async function safeUpsert(chunk: UsersRow[]) {
  // Pre-empt duplicate usernames inside this chunk
  const seen = new Set<string>();
  for (const r of chunk) {
    if (r.username) {
      const key = r.username.toLowerCase();
      if (seen.has(key)) r.username = null;
      else seen.add(key);
    }
  }

  let { error } = await supabase.from('users').upsert(chunk, { onConflict: 'auth0_sub' });

  if (error) {
    // If unique(username) conflicts with existing rows, null usernames and retry once
    // (Postgres error code 23505 typically; Supabase may not always surface code)
    console.warn('Upsert conflict; retrying with username=null. Details:', error);
    const noUsernames = chunk.map((r) => ({ ...r, username: null }));
    const retry = await supabase.from('users').upsert(noUsernames, { onConflict: 'auth0_sub' });
    if (retry.error) throw retry.error;
  }
}

async function upsertInChunks(rows: UsersRow[], size = 300) {
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    await safeUpsert(chunk);
    console.log(`Upserted ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
}

/* ----------------------------------- Main ---------------------------------- */
(async () => {
  console.time('auth0->supabase migrate');
  const token = await getMgmtToken();
  const auth0Users = await fetchAllAuth0Users(token);
  const rows = mapRows(auth0Users);
  await upsertInChunks(rows);
  console.timeEnd('auth0->supabase migrate');
  console.log('Done.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
