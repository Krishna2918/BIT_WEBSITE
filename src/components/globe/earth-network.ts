import Delaunator from "delaunator";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import landTopo from "world-atlas/land-110m.json";

export type NodeKind = 0 | 1 | 2; // ocean, land, coast

export type NetworkBuffers = {
  positions: Float32Array;
  kinds: Float32Array;
  linePositions: Float32Array;
  lineKinds: Float32Array;
  lineColors: Float32Array;
  faceIndex: Uint32Array;
  nodeCount: number;
  radius: number;
};

export type NetworkParams = {
  radius: number;
  landDensity: number;
  oceanDensity: number;
  nodeBudget: number;
};

const TEX_W = 1024;
const TEX_H = 512;

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function lonLatToXY(lon: number, lat: number, w: number, h: number): [number, number] {
  return [((lon + 180) / 360) * w, ((90 - lat) / 180) * h];
}

function drawPolygon(ctx: CanvasRenderingContext2D, rings: number[][][], w: number, h: number) {
  ctx.beginPath();
  for (const ring of rings) {
    if (ring.length < 3) continue;
    const first = ring[0]!;
    const [x0, y0] = lonLatToXY(first[0]!, first[1]!, w, h);
    ctx.moveTo(x0, y0);
    for (let i = 1; i < ring.length; i++) {
      const c = ring[i]!;
      const [x, y] = lonLatToXY(c[0]!, c[1]!, w, h);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  ctx.fill("evenodd");
}

function boxBlur(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const span = radius * 2 + 1;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -radius; x <= radius; x++) acc += src[y * w + clamp(x, 0, w - 1)]!;
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / span;
      acc += src[y * w + clamp(x + radius + 1, 0, w - 1)]! - src[y * w + clamp(x - radius, 0, w - 1)]!;
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -radius; y <= radius; y++) acc += tmp[clamp(y, 0, h - 1) * w + x]!;
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / span;
      acc += tmp[clamp(y + radius + 1, 0, h - 1) * w + x]! - tmp[clamp(y - radius, 0, h - 1) * w + x]!;
    }
  }
  return out;
}

function rasterizeLandMask(w: number, h: number): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array(w * h);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  try {
    const topo = landTopo as Topology<{ land: GeometryCollection }>;
    const geo = feature(topo, topo.objects.land);
    const features: GeoJSON.Feature[] = "features" in geo ? geo.features : [geo];
    for (const f of features) {
      const g = f.geometry;
      if (!g) continue;
      if (g.type === "Polygon") drawPolygon(ctx, g.coordinates as number[][][], w, h);
      if (g.type === "MultiPolygon") {
        for (const poly of g.coordinates as number[][][][]) drawPolygon(ctx, poly, w, h);
      }
    }
  } catch {
    /* empty mask — scatter still runs */
  }
  const img = ctx.getImageData(0, 0, w, h);
  const raw = new Float32Array(w * h);
  for (let i = 0; i < raw.length; i++) raw[i] = img.data[i * 4]! / 255;
  return boxBlur(raw, w, h, 2);
}

function sampleMask(mask: Float32Array, w: number, h: number, u: number, v: number): number {
  const x = ((((u % 1) + 1) % 1) * (w - 1));
  const y = clamp(v, 0, 1) * (h - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const tx = x - x0;
  const ty = y - y0;
  return (
    mask[y0 * w + x0]! * (1 - tx) * (1 - ty) +
    mask[y0 * w + x1]! * tx * (1 - ty) +
    mask[y1 * w + x0]! * (1 - tx) * ty +
    mask[y1 * w + x1]! * tx * ty
  );
}

export function lonLatToPosition(lon: number, lat: number, radius: number): [number, number, number] {
  const latR = (lat * Math.PI) / 180;
  const lonR = (lon * Math.PI) / 180;
  const cl = Math.cos(latR);
  return [cl * Math.cos(lonR) * radius, Math.sin(latR) * radius, -cl * Math.sin(lonR) * radius];
}

function dirToUv(x: number, y: number, z: number): [number, number, number, number] {
  let u = Math.atan2(z, -x) / (Math.PI * 2);
  if (u < 0) u += 1;
  const v = Math.acos(clamp(y, -1, 1)) / Math.PI;
  const lon = u * 360 - 180;
  const lat = 90 - v * 180;
  return [u, v, lon, lat];
}

function fibonacciDir(i: number, n: number): [number, number, number] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - ((i + 0.5) / n) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * i;
  return [Math.cos(theta) * r, y, Math.sin(theta) * r];
}

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function hexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [srgbToLinear(((n >> 16) & 255) / 255), srgbToLinear(((n >> 8) & 255) / 255), srgbToLinear((n & 255) / 255)];
}

const COL_LINE = hexToLinear("#5DAEF7");
const COL_LAND = hexToLinear("#238FE8");
const COL_PALE = hexToLinear("#B9DBFA");
const COL_OCEAN = hexToLinear("#C9E2F8");

function pickStride(arr: number[], target: number): number[] {
  if (arr.length <= target) return arr;
  const out: number[] = [];
  const step = arr.length / target;
  for (let i = 0; i < target; i++) out.push(arr[Math.floor(i * step)]!);
  return out;
}

function angularSep(ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
  return Math.acos(clamp(ax * bx + ay * by + az * bz, -1, 1));
}

export function buildNetwork(params: NetworkParams): NetworkBuffers {
  const { radius, landDensity, oceanDensity, nodeBudget } = params;
  const mask = rasterizeLandMask(TEX_W, TEX_H);

  const baseCount = Math.floor(nodeBudget * 0.38);
  const landExtra = Math.floor(nodeBudget * 0.46 * landDensity);
  const coastExtra = Math.floor(nodeBudget * 0.16 * landDensity);
  const fibN = Math.min(Math.floor(nodeBudget * 4), 42000);

  const landIdx: number[] = [];
  const coastIdx: number[] = [];

  for (let i = 0; i < fibN; i++) {
    const [x, y, z] = fibonacciDir(i, fibN);
    const [u, v] = dirToUv(x, y, z);
    const land = sampleMask(mask, TEX_W, TEX_H, u, v);
    if (land > 0.5) {
      landIdx.push(i);
      const e = 0.0035;
      if (
        sampleMask(mask, TEX_W, TEX_H, u + e, v) < 0.5 ||
        sampleMask(mask, TEX_W, TEX_H, u, v + e * 2) < 0.5 ||
        sampleMask(mask, TEX_W, TEX_H, u - e, v) < 0.5
      ) {
        coastIdx.push(i);
      }
    }
  }

  const landPick = pickStride(landIdx, landExtra);
  const coastPick = pickStride(coastIdx, coastExtra);

  type Node = { x: number; y: number; z: number; lon: number; lat: number; kind: NodeKind };
  const nodes: Node[] = [];

  const emitDir = (x0: number, y0: number, z0: number, kind: NodeKind, seed: number) => {
    let x = x0 + (hash2(seed, 1.7) - 0.5) * (kind === 0 ? 0.006 : 0.012);
    let y = y0 + (hash2(seed, 3.1) - 0.5) * (kind === 0 ? 0.006 : 0.012);
    let z = z0 + (hash2(seed, 5.9) - 0.5) * (kind === 0 ? 0.006 : 0.012);
    const len = Math.hypot(x, y, z) || 1;
    x /= len;
    y /= len;
    z /= len;
    const [, , lon, lat] = dirToUv(x, y, z);
    const lift = kind === 2 ? 0.017 : kind === 1 ? 0.012 : 0.006;
    nodes.push({ x: x * (radius + lift), y: y * (radius + lift), z: z * (radius + lift), lon, lat, kind });
  };

  for (let i = 0; i < baseCount; i++) {
    const [x, y, z] = fibonacciDir(i, baseCount);
    const [u, v] = dirToUv(x, y, z);
    const land = sampleMask(mask, TEX_W, TEX_H, u, v);
    emitDir(x, y, z, land > 0.5 ? 1 : 0, i + 17);
  }
  for (const i of landPick) {
    const [x, y, z] = fibonacciDir(i, fibN);
    emitDir(x, y, z, 1, i + 101);
  }
  for (const i of coastPick) {
    const [x, y, z] = fibonacciDir(i, fibN);
    emitDir(x, y, z, 2, i + 303);
  }

  const coords: number[][] = [];
  const remap: number[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i]!;
    coords.push([p.lon, p.lat]);
    remap.push(i);
    if (p.lon > 150) {
      coords.push([p.lon - 360, p.lat]);
      remap.push(i);
    } else if (p.lon < -150) {
      coords.push([p.lon + 360, p.lat]);
      remap.push(i);
    }
  }

  const del = Delaunator.from(coords);
  const faces: number[] = [];
  const edgeKey = new Set<string>();
  const edges: [number, number][] = [];
  const maxLand = 0.15;
  const maxOcean = 0.3;

  const addEdge = (a: number, b: number) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (edgeKey.has(k)) return;
    edgeKey.add(k);
    edges.push([a, b]);
  };

  for (let t = 0; t < del.triangles.length; t += 3) {
    const a = remap[del.triangles[t]!]!;
    const b = remap[del.triangles[t + 1]!]!;
    const c = remap[del.triangles[t + 2]!]!;
    if (a === b || b === c || a === c) continue;
    const A = nodes[a]!;
    const B = nodes[b]!;
    const C = nodes[c]!;
    const ra = Math.hypot(A.x, A.y, A.z);
    const rb = Math.hypot(B.x, B.y, B.z);
    const rc = Math.hypot(C.x, C.y, C.z);
    const landish = A.kind + B.kind + C.kind > 0;
    const limit = landish ? maxLand : maxOcean;
    if (
      angularSep(A.x / ra, A.y / ra, A.z / ra, B.x / rb, B.y / rb, B.z / rb) > limit ||
      angularSep(B.x / rb, B.y / rb, B.z / rb, C.x / rc, C.y / rc, C.z / rc) > limit ||
      angularSep(C.x / rc, C.y / rc, C.z / rc, A.x / ra, A.y / ra, A.z / ra) > limit
    ) {
      continue;
    }
    faces.push(a, b, c);
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }

  const positions = new Float32Array(nodes.length * 3);
  const kinds = new Float32Array(nodes.length);
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i]!;
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
    kinds[i] = p.kind;
  }

  const linePositions = new Float32Array(edges.length * 6);
  const lineKinds = new Float32Array(edges.length * 2);
  const lineColors = new Float32Array(edges.length * 6);
  for (let i = 0; i < edges.length; i++) {
    const [ia, ib] = edges[i]!;
    const A = nodes[ia]!;
    const B = nodes[ib]!;
    const o = i * 6;
    linePositions[o] = A.x;
    linePositions[o + 1] = A.y;
    linePositions[o + 2] = A.z;
    linePositions[o + 3] = B.x;
    linePositions[o + 4] = B.y;
    linePositions[o + 5] = B.z;
    const ka = A.kind;
    const kb = B.kind;
    lineKinds[i * 2] = ka;
    lineKinds[i * 2 + 1] = kb;
    const landish = Math.max(ka, kb) > 0 ? 1 : 0;
    const mix = landish ? 0.55 + hash2(ia, ib) * 0.45 : 0.15 + hash2(ia, ib) * 0.35;
    const ca = landish ? COL_LAND : COL_OCEAN;
    const cb = landish ? COL_LINE : COL_PALE;
    for (let k = 0; k < 3; k++) {
      const v = ca[k]! * (1 - mix) + cb[k]! * mix;
      lineColors[o + k] = v;
      lineColors[o + 3 + k] = v;
    }
  }

  return {
    positions,
    kinds,
    linePositions,
    lineKinds,
    lineColors,
    faceIndex: Uint32Array.from(faces),
    nodeCount: nodes.length,
    radius,
  };
}

export function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 720 || window.innerHeight < 480;
}

export function debugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("debug");
}


let cached: NetworkBuffers | null = null;
let stippleCached: NetworkBuffers | null = null;

export function buildNetworkCached(params: NetworkParams): NetworkBuffers {
  if (cached) return cached;
  cached = buildNetwork(params);
  return cached;
}

export function buildStipple(params: NetworkParams): NetworkBuffers {
  const { radius, nodeBudget } = params;
  const mask = rasterizeLandMask(TEX_W, TEX_H);
  const fibN = Math.min(Math.max(nodeBudget * 2, 24000), 140000);

  const xs: number[] = [];
  const ks: number[] = [];

  const emit = (x0: number, y0: number, z0: number, kind: number, seed: number) => {
    let x = x0 + (hash2(seed, 1.3) - 0.5) * 0.01;
    let y = y0 + (hash2(seed, 4.7) - 0.5) * 0.01;
    let z = z0 + (hash2(seed, 8.2) - 0.5) * 0.01;
    const len = Math.hypot(x, y, z) || 1;
    x /= len;
    y /= len;
    z /= len;
    const lift = 0.004 + kind * 0.008;
    xs.push(x * (radius + lift), y * (radius + lift), z * (radius + lift));
    ks.push(kind);
  };

  for (let i = 0; i < fibN; i++) {
    const [x, y, z] = fibonacciDir(i, fibN);
    const [u, v] = dirToUv(x, y, z);
    const land = sampleMask(mask, TEX_W, TEX_H, u, v);
    const h = hash2(i, 19.1);
    if (land > 0.42) {
      emit(x, y, z, Math.min(1, 0.55 + land * 0.5), i);
      if (land > 0.62 && h < 0.72) emit(x, y, z, 1, i + 90001);
      if (land > 0.78 && h < 0.4) emit(x, y, z, 1, i + 170003);
    } else if (h < 0.34) {
      emit(x, y, z, land * 0.35, i);
    }
  }

  const positions = new Float32Array(xs);
  const kinds = new Float32Array(ks);
  return {
    positions,
    kinds,
    linePositions: new Float32Array(0),
    lineKinds: new Float32Array(0),
    lineColors: new Float32Array(0),
    faceIndex: new Uint32Array(0),
    nodeCount: ks.length,
    radius,
  };
}

export function buildStippleCached(params: NetworkParams): NetworkBuffers {
  if (stippleCached) return stippleCached;
  stippleCached = buildStipple(params);
  return stippleCached;
}
