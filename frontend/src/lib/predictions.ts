import { apiFetch } from './api';
import { driverHeadshots } from './driverHeadshots';
import { driverTeamMapping } from './driverTeamMapping';

export type PredictionRow = {
  driverId: number | string;
  driverFullName: string;
  team: string;
  headshotUrl: string | null;
  weightedFormNorm: number;
  seasonNorm: number;
  constructorNorm: number;
  CPS: number;
  winProbability: number;
  predictedPoints: number;
  position: number;
  confidence: number;
};

const POINTS_MAP = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const pointsForPosition = (pos?: any) => {
  if (pos == null) return 0;
  const n = Number(pos);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n <= 10 ? POINTS_MAP[n - 1] : 0;
};

export async function computePredictions(seasonYear?: number | null): Promise<PredictionRow[]> {
  const effectiveSeason = seasonYear ?? new Date().getFullYear();

  // 1) drivers
  const driversRes = await apiFetch<any[]>(`/api/drivers`);
  const drivers = Array.isArray(driversRes) ? driversRes : [];

  // 2) recent form per driver
  const concurrency = 8;
  const chunks: any[][] = [];
  for (let i = 0; i < drivers.length; i += concurrency) chunks.push(drivers.slice(i, i + concurrency));
  const recentFormByDriver = new Map<number | string, any[]>();
  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map((d) => apiFetch(`/api/drivers/${d.id}/recent-form`).catch((e) => { throw { e, id: d.id }; }))
    );
    results.forEach((res, idx) => {
      const drv = chunk[idx];
      if (res.status === 'fulfilled') {
        recentFormByDriver.set(drv.id, Array.isArray(res.value) ? res.value.slice(0, 5) : []);
      } else {
        recentFormByDriver.set(drv.id, []);
      }
    });
  }

  // 3) season standings
  const standings = await apiFetch<any[]>(`/api/drivers/standings/${effectiveSeason}`).catch(() => []);
  const seasonPointsByDriver = new Map<number, number>();
  const constructorIdByDriver = new Map<number, number>();
  if (Array.isArray(standings)) {
    for (const s of standings) {
      const drv = s.driver || s.Driver || s.driverInfo || {};
      const driverId = drv.id ?? s.driver_id ?? s.id;
      if (driverId != null) {
        const pts = s.points ?? s.totalPoints ?? s.season_points ?? 0;
        seasonPointsByDriver.set(Number(driverId), Number(pts) || 0);
      }
      const cId = s.constructorId ?? s.constructor_id ?? s.team_id ?? s.teamId;
      if (driverId != null && cId != null) constructorIdByDriver.set(Number(driverId), Number(cId));
    }
  }

  // Fallback constructor ids from driver object
  const fallbackConstructorIds = new Set<number>();
  for (const d of drivers) {
    const did = Number(d.id);
    if (!Number.isFinite(did)) continue;
    if (!constructorIdByDriver.has(did)) {
      const cand = [d.constructor_id, d.team_id, d.teamId, d.constructorId, d.current_team_id]
        .map((v: any) => Number(v))
        .find((n) => Number.isFinite(n));
      if (Number.isFinite(cand)) {
        constructorIdByDriver.set(did, Number(cand));
        fallbackConstructorIds.add(Number(cand));
      }
    }
  }

  // 4) constructor strength
  const uniqueConstructorIds = Array.from(new Set([
    ...Array.from(constructorIdByDriver.values()),
    ...Array.from(fallbackConstructorIds.values()),
  ]));
  const constructorPointsThisSeason = new Map<number, number>();
  if (uniqueConstructorIds.length) {
    const consChunks: number[][] = [];
    for (let i = 0; i < uniqueConstructorIds.length; i += concurrency) consChunks.push(uniqueConstructorIds.slice(i, i + concurrency));
    for (const chunk of consChunks) {
      const results = await Promise.allSettled(
        chunk.map((cid) => apiFetch(`/api/constructors/${cid}/points-per-season`))
      );
      results.forEach((res, idx) => {
        const cid = chunk[idx];
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          let pts = 0;
          let latestYear = -Infinity;
          for (const row of res.value) {
            const year = Number(row.season ?? row.year ?? row.season_id ?? row.seasonId);
            const p = Number(row.points ?? row.totalPoints ?? row.pts ?? 0);
            if (year === effectiveSeason) { pts = p; latestYear = year; break; }
            if (Number.isFinite(year) && year > latestYear) { latestYear = year; pts = p; }
          }
          constructorPointsThisSeason.set(cid, pts || 0);
        } else {
          constructorPointsThisSeason.set(cid, 0);
        }
      });
    }
  }

  // 5) compute
  const sumWeights = 5 + 4 + 3 + 2 + 1; // 15
  const maxPointsPerRace = 25;
  const maxWeightedPoints = sumWeights * maxPointsPerRace; // 375

  const toTime = (x: any): number | null => {
    if (!x) return null;
    const d = new Date(x);
    return isNaN(d.getTime()) ? null : d.getTime();
  };
  const recencyKey = (r: any): number => {
    const ts = toTime(r.date || r.race_date || r.session_date || r.started_at || r.start_time || r.timestamp);
    if (ts != null) return ts;
    const season = Number(r.season ?? r.year ?? r.season_id ?? r.seasonId);
    const round = Number(r.round ?? r.race_round ?? r.round_number ?? r.rnd);
    if (Number.isFinite(season) && Number.isFinite(round)) return season * 100 + round;
    const rid = Number(r.race_id ?? r.session_id ?? r.id);
    if (Number.isFinite(rid)) return rid;
    return 0;
  };

  const interim = drivers.map((d) => {
    const recent = recentFormByDriver.get(d.id) || [];
    const sorted = recent.slice().sort((a, b) => recencyKey(b) - recencyKey(a));
    const last5 = sorted.slice(0, 5);
    let weighted = 0;
    last5.forEach((r: any, idx: number) => {
      const weight = 5 - idx;
      const status = (r.status || r.result_status || r.classification || '').toString().toUpperCase();
      const posCandidates = [r.position, r.finish_position, r.finishing_position, r.final_position, r.result, r.pos, r.position_text, r.positionText].filter((v) => v != null);
      let finishPos: number | null = null;
      for (const c of posCandidates) { if (typeof c === 'number') { finishPos = c; break; } const m = String(c).match(/\d+/); if (m) { finishPos = Number(m[0]); break; } }
      const posText = String(posCandidates[0] ?? '').toUpperCase();
      const isDnf = /DNF|RET|RETIRED|DSQ|DNS|DNQ|DQ/.test([status, posText].join(' ')) || finishPos === null || finishPos === 0 || finishPos > 50;
      const pointsField = (r as any).points ?? (r as any).pts ?? (r as any).point ?? (r as any).score;
      const pts = isDnf ? 0 : ((typeof pointsField === 'number' && Number.isFinite(pointsField)) ? pointsField : pointsForPosition(finishPos));
      weighted += pts * weight;
    });
    const weightedFormNorm = Math.max(0, Math.min(1, weighted / maxWeightedPoints));

    const seasonPts = seasonPointsByDriver.get(Number(d.id)) || 0;
    let teamId = constructorIdByDriver.get(Number(d.id)) ?? null;
    if (teamId == null) {
      const cand = [d.constructor_id, d.team_id, d.teamId, d.constructorId, d.current_team_id]
        .map((v: any) => Number(v))
        .find((n) => Number.isFinite(n));
      if (Number.isFinite(cand)) teamId = Number(cand);
    }
    const teamPts = teamId != null ? (constructorPointsThisSeason.get(teamId as number) || 0) : 0;

    const driverFullName = (
      `${d.first_name ?? d.firstName ?? ''} ${d.last_name ?? d.lastName ?? ''}`.trim() ||
      d.full_name || d.fullName || d.name || 'Unknown'
    );
    const teamName = d.team_name || d.teamName || d.constructor_name || d.constructorName || d.team || driverTeamMapping[driverFullName] || '—';
    const imgCandidates = [d.profile_image_url, d.profile_image, d.profileImageUrl, d.headshot_url, d.headshotUrl, d.image_url, d.imageUrl, d.photo_url, d.photoUrl].filter(Boolean);
    const headshotUrl = imgCandidates.length > 0 ? (imgCandidates[0] as string) : (driverHeadshots[driverFullName] || null);

    return { d, weightedFormNorm, seasonPts, teamId, teamPts, driverFullName, teamName, headshotUrl };
  });

  const maxSeasonPts = Math.max(1, ...interim.map((r) => r.seasonPts || 0));
  const maxTeamPts = Math.max(1, ...interim.map((r) => r.teamPts || 0));

  const rows: PredictionRow[] = interim.map(({ d, weightedFormNorm, seasonPts, teamPts, driverFullName, teamName, headshotUrl }) => {
    const seasonNorm = (seasonPts || 0) / maxSeasonPts;
    const constructorNorm = (teamPts || 0) / maxTeamPts;
    const CPS = 0.5 * weightedFormNorm + 0.3 * seasonNorm + 0.2 * constructorNorm;
    return {
      driverId: d.id,
      driverFullName,
      team: teamName,
      headshotUrl,
      weightedFormNorm,
      seasonNorm,
      constructorNorm,
      CPS,
      winProbability: 0,
      predictedPoints: 0,
      position: 0,
      confidence: 0,
    };
  });

  const sumCPS = rows.reduce((acc, r) => acc + (r.CPS || 0), 0) || 1;
  const withProb = rows.map((r) => ({
    ...r,
    winProbability: r.CPS / sumCPS,
    predictedPoints: Math.round(r.CPS * 25 * 10) / 10,
  }));

  const ranked = withProb
    .sort((a, b) => b.CPS - a.CPS)
    .map((p, idx) => ({ ...p, position: idx + 1, confidence: Math.round(p.winProbability * 100) }));

  return ranked;
}
