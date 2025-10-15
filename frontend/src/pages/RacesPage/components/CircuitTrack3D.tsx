// src/pages/RacesPage/components/CircuitTrack3D.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  CatmullRomCurve3,
  Vector3,
  EllipseCurve,
  BufferGeometry,
  Float32BufferAttribute,
} from 'three';
import { Line, Html } from '@react-three/drei';
import { Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import { circuitFileMap } from './circuitFileMap';

type GeoJSONGeometry =
  | {
      type: 'LineString';
      coordinates: number[][];
    }
  | {
      type: 'MultiLineString';
      coordinates: number[][][];
    }
  | {
      type: 'Polygon';
      coordinates: number[][][]; // we’ll use the outer ring as fallback if needed
    }
  | {
      type: 'MultiPolygon';
      coordinates: number[][][][]; // outer ring of first polygon as last-ditch fallback
    };

type GeoJSONFeature = {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties?: Record<string, unknown>;
};

type GeoJSONFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
};

type AnyGeoJSON = GeoJSONFeature | GeoJSONFeatureCollection | GeoJSONGeometry;

interface Props {
  circuitId: number;
  circuitName?: string;
  onStatusChange?: (status: 'loading' | 'ready' | 'missing') => void;
}

/* ------------------------- helpers: coords handling ------------------------ */

// robustly flatten coords from LineString/MultiLineString/Polygon/MultiPolygon to [ [x,y], ... ]
function extractXY(data: AnyGeoJSON): number[][] {
  const lines: number[][] = [];

  const pushLine = (arr: number[][]) => {
    for (let i = 0; i < arr.length; i++) {
      const p = arr[i];
      if (!p || p.length < 2) continue;
      const x = Number(p[0]);
      const y = Number(p[1]);
      if (Number.isFinite(x) && Number.isFinite(y)) lines.push([x, y]);
    }
  };

  const handleGeometry = (g: GeoJSONGeometry) => {
    if (g.type === 'LineString') {
      pushLine(g.coordinates);
    } else if (g.type === 'MultiLineString') {
      g.coordinates.forEach(pushLine);
    } else if (g.type === 'Polygon') {
      // use outer ring as a fallback
      if (g.coordinates.length) pushLine(g.coordinates[0]);
    } else if (g.type === 'MultiPolygon') {
      // outer ring of first polygon as a fallback
      if (g.coordinates.length && g.coordinates[0].length) pushLine(g.coordinates[0][0]);
    }
  };

  if ((data as GeoJSONFeatureCollection).type === 'FeatureCollection') {
    (data as GeoJSONFeatureCollection).features.forEach((f) => {
      if (f && f.geometry) handleGeometry(f.geometry);
    });
  } else if ((data as GeoJSONFeature).type === 'Feature' && (data as GeoJSONFeature).geometry) {
    handleGeometry((data as GeoJSONFeature).geometry);
  } else {
    // maybe it's a bare geometry
    const g = data as GeoJSONGeometry;
    if (g && g.type) handleGeometry(g);
  }

  return lines;
}

function isLatLon(all: number[][]): boolean {
  if (!all.length) return false;
  // Ensure *all* points fall into lon/lat ranges
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of all) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return maxX <= 180 && minX >= -180 && maxY <= 90 && minY >= -90;
}

// Use a light equirectangular projection (keeps aspect correct and fast).
// We *don’t* scale to meters here; normalization will handle final scale.
function projectLatLonToXY(coords: number[][]): number[][] {
  const meanLat =
    coords.reduce((sum, [, lat]) => sum + lat, 0) / Math.max(1, coords.length);
  const cosLat = Math.cos((meanLat * Math.PI) / 180);
  return coords.map(([lon, lat]) => [lon * cosLat, lat]);
}

// dedupe consecutive points & filter bad values
function cleanCoords(coords: number[][]): number[][] {
  const out: number[][] = [];
  let prevX: number | null = null;
  let prevY: number | null = null;
  for (const [x, y] of coords) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (prevX === x && prevY === y) continue;
    out.push([x, y]);
    prevX = x;
    prevY = y;
  }
  return out;
}

function normalizeTrack(points: Vector3[]): Vector3[] {
  if (points.length === 0) return points;
  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.z < minZ) minZ = p.z;
    if (p.z > maxZ) maxZ = p.z;
  }
  const width = Math.max(1e-6, maxX - minX);
  const height = Math.max(1e-6, maxZ - minZ);
  const scale = 30 / Math.max(width, height);
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;

  // center & scale to ~30 world units
  const scaled = points.map(
    (p) => new Vector3((p.x - cx) * scale, 0, (p.z - cz) * scale)
  );

  // ensure clockwise orientation (optional): flip if needed so north=+z
  // (Not strictly required; comment out if undesired)
  // if (scaled.length >= 3) {
  //   let area = 0;
  //   for (let i = 0; i < scaled.length; i++) {
  //     const a = scaled[i];
  //     const b = scaled[(i + 1) % scaled.length];
  //     area += a.x * b.z - b.x * a.z;
  //   }
  //   if (area < 0) scaled.reverse();
  // }

  return scaled;
}

/* -------------------------------- component -------------------------------- */

export const CircuitTrack3D: React.FC<Props> = ({
  circuitId,
  circuitName,
  onStatusChange,
}) => {
  const [coords, setCoords] = useState<Vector3[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false);

  // Theme-aware colors
  const trackColor = useColorModeValue('#dc2626', '#d22'); // Red for light mode, slightly different red for dark
  const loadingTextColor = useColorModeValue('gray.800', 'white');
  const errorBgColor = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(0,0,0,0.7)');
  const errorTextColor = useColorModeValue('gray.800', 'white');
  const errorSecondaryTextColor = useColorModeValue('gray.600', 'gray.500');

  useEffect(() => {
    let cancelled = false;

    const slugify = (s: string) =>
      s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const baseName = circuitName ? slugify(circuitName) : '';
    const shortName = baseName
      .replace(/-international|-grand-prix|-autodrome|-autodromo|-circuit-park|-circuit/gi, '')
      .replace(/-gp$/i, '')
      .replace(/--+/g, '-');

    const mappedName = circuitFileMap[circuitId];

    const candidates = [
      mappedName ? `/circuits/${mappedName}.geojson` : '',
      baseName ? `/circuits/${baseName}.geojson` : '',
      shortName ? `/circuits/${shortName}.geojson` : '',
      `/circuits/${circuitId}.geojson`, // keep as last resort
    ]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i) as string[];

    async function tryLoad(url: string): Promise<number[][] | null> {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;

      // Some static hosts don’t return a JSON content-type. Try to parse anyway,
      // but protect against HTML fallback (starts with "<!")
      const text = await res.text();
      const snippet = text.slice(0, 32).toLowerCase();
      if (snippet.startsWith('<!doctype') || snippet.startsWith('<html')) {
        // definitely not JSON
        return null;
      }

      let json: AnyGeoJSON;
      try {
        json = JSON.parse(text);
      } catch {
        return null;
      }

      const xy = extractXY(json);
      if (xy.length < 2) return null;
      return xy;
    }

    async function loadGeometry() {
      setLoading(true);
      setLoadingFailed(false);
      onStatusChange?.('loading');
      setCoords(null);

      let lines: number[][] | null = null;
      for (const url of candidates) {
        try {
          const res = await tryLoad(url);
          if (res && res.length > 1) {
            lines = res;
            break;
          }
        } catch {
          // continue
        }
      }

      if (!lines || lines.length < 2) {
        if (!cancelled) {
          setLoading(false);
          setLoadingFailed(true);
          onStatusChange?.('missing');
        }
        return;
      }

      // Clean & project if needed
      lines = cleanCoords(lines);
      if (isLatLon(lines)) {
        // Project geographic lon/lat -> planar XY
        lines = projectLatLonToXY(lines);
      }

      // Build Vector3s in XZ plane (Y up)
      const pts = lines.map(([x, y]) => new Vector3(x, 0, y));

      // Normalize to nice size and center
      const normalized = normalizeTrack(pts);

      if (!cancelled) {
        setCoords(normalized);
        setLoading(false);
        setLoadingFailed(false);
        onStatusChange?.('ready');
      }
    }

    loadGeometry();
    return () => {
      cancelled = true;
    };
  }, [circuitId, circuitName, onStatusChange]);

  const linePoints = useMemo(() => {
    if (!coords || coords.length < 2) return null;

    // Reduce risk of GPU/context loss by clamping point count if huge
    const closed = true;
    const curve = new CatmullRomCurve3(coords, closed, 'catmullrom', 0.05);
    const samples = Math.min(1000, Math.max(100, Math.floor(coords.length * 4)));
    return curve.getPoints(samples);
  }, [coords]);

  if (loading) {
    // Show a nice loading spinner in 3D space
    return (
      <Html center style={{ pointerEvents: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Spinner size="lg" color="brand.red" thickness="4px" />
          <Text color={loadingTextColor} fontSize="sm" fontWeight="medium">
            Loading track layout...
          </Text>
        </div>
      </Html>
    );
  }

  if (!linePoints) {
    // Show a simple placeholder track when data is missing
    const ellipse = new EllipseCurve(0, 0, 20, 12, 0, Math.PI * 2, false, 0);
    const points2d = ellipse.getPoints(200);
    const positions: number[] = [];
    points2d.forEach((p) => {
      positions.push(p.x, 0, p.y);
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    return (
      <>
        <line>
          <primitive object={geometry} attach="geometry" />
          <lineBasicMaterial color={useColorModeValue('#666', '#888')} linewidth={1} />
        </line>
        {loadingFailed && (
          <Html center style={{ pointerEvents: 'none' }}>
            <div
              style={{
                background: errorBgColor,
                color: errorTextColor,
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 14,
                textAlign: 'center',
                maxWidth: 300,
              }}
            >
              <Text fontSize="sm" mb={2} color={errorTextColor}>
                Track layout not available
              </Text>
              <Text fontSize="xs" color={errorSecondaryTextColor}>
                {circuitName || `Circuit #${circuitId}`}
              </Text>
            </div>
          </Html>
        )}
      </>
    );
  }

  return <Line points={linePoints} color={trackColor} lineWidth={2} />;
};

export default CircuitTrack3D;
