// Dynamically import all logos under src/assets/team_logos (png/svg)
// Vite resolves these at build time and returns URLs
const logoModules = import.meta.glob('../assets/team_logos/*.{png,svg}', { eager: true, import: 'default' }) as Record<string, string>;

// Build a lookup of slug -> url from filenames
const filenameToUrl: Record<string, string> = {};
Object.entries(logoModules).forEach(([path, url]) => {
  const filename = path.split('/').pop() || '';
  const base = filename.replace(/\.(png|svg)$/i, '');
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '');
  filenameToUrl[slug] = url;
});

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizeTeamName(name: string): string {
  // Normalize common sponsor variants to canonical tokens
  let n = name.toLowerCase();
  if (n.includes('visa cash app rb') || n.includes('vcarb') || n.includes('alphatauri') || n.includes('rb f1')) n = 'rb';
  if (n.includes('stake') || n.includes('sauber') || n.includes('alfa romeo')) n = 'sauber';
  if (n.includes('mercedes')) n = 'mercedes';
  if (n.includes('red bull')) n = 'redbull';
  if (n.includes('mclaren')) n = 'mclaren';
  if (n.includes('aston martin')) n = 'astonmartin';
  if (n.includes('alpine')) n = 'alpine';
  if (n.includes('williams')) n = 'williams';
  if (n.includes('haas')) n = 'haas';
  if (n.includes('ferrari')) n = 'ferrari';
  return n;
}

export function getTeamLogo(teamName: string | undefined | null): string {
  if (!teamName) return '';
  const norm = normalizeTeamName(teamName);
  const candidates = [slugify(teamName), norm];

  for (const key of candidates) {
    if (filenameToUrl[key]) return filenameToUrl[key];
  }

  // Fallback: fuzzy contains search across filenames
  const match = Object.entries(filenameToUrl).find(([slug]) => slug.includes(norm) || norm.includes(slug));
  if (match) return match[1];

  return '';
}
