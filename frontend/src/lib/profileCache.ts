// frontend/src/lib/profileCache.ts
//
// One dashboard load mounts five independent consumers of GET /api/profile:
//   - ThemeColorContext            (via useUserProfile)
//   - DashboardHeader              (via useProfile)
//   - useDashboardPreferences      (direct fetch)
//   - FavoriteDriverSnapshotWidget (via useUserProfile)
//   - FavoriteTeamSnapshotWidget   (via useUserProfile)
//
// Each ran its own Auth0 token exchange plus fetch, so a single page load paid
// for five identical round-trips against a cold-start-prone API. This collapses
// them into one shared request.
//
// Deliberately small: an in-flight promise plus a short TTL. Writes call
// invalidateUserProfile(), so the TTL only ever hides changes made outside this
// tab, and only for a minute.

const TTL_MS = 60_000;

interface CacheEntry {
  key: string;
  at: number;
  data: unknown;
}

interface InFlight {
  id: number;
  key: string;
  promise: Promise<unknown>;
}

let entry: CacheEntry | null = null;
let inFlight: InFlight | null = null;
let seq = 0;

/** Drop the cached profile. Call after any write, or on sign-out. */
export function invalidateUserProfile(): void {
  entry = null;
  inFlight = null;
}

/**
 * Run `loader` at most once per `key` per TTL, sharing the result with every
 * concurrent caller.
 *
 * @param key    Identity the cache is scoped to — pass the Auth0 `sub` so a user
 *               switch can never read the previous user's profile.
 * @param loader Performs the actual token exchange + fetch.
 */
export async function loadUserProfile<T>(
  key: string,
  loader: () => Promise<T>,
  options: { force?: boolean } = {},
): Promise<T> {
  if (options.force) {
    invalidateUserProfile();
  } else {
    if (entry && entry.key === key && Date.now() - entry.at < TTL_MS) {
      return entry.data as T;
    }
    if (inFlight && inFlight.key === key) {
      return inFlight.promise as Promise<T>;
    }
  }

  const id = ++seq;
  const promise = (async () => {
    try {
      const data = await loader();
      entry = { key, at: Date.now(), data };
      return data;
    } catch (err) {
      // Never cache a failure — the next consumer should get a real retry.
      if (entry && entry.key === key) entry = null;
      throw err;
    } finally {
      if (inFlight && inFlight.id === id) inFlight = null;
    }
  })();

  inFlight = { id, key, promise };
  return promise;
}
