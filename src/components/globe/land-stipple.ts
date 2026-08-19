import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import landTopo from "world-atlas/land-110m.json";

export type StippleCloud = {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  seeds: Float32Array;
  densities: Float32Array;
  count: number;
};

export type StudioParticles = {
  base: StippleCloud;
  land: StippleCloud;
  internal: StippleCloud;
};

const TEX_W = 2048;
const TEX_H = 1024;
const SEED = 20260819;

const HEX = {
  white: [0xdf, 0xe6, 0xef],
  pale: [0xb1, 0xd2, 0xeb],
  bright: [0x88, 0xbf, 0xe8],
  struct: [0x7f, 0xa8, 0xcd],
  primary: [0x55, 0x98, 0xcf],
  deep: [0x33, 0x74, 0xb1],
  frost: [0xaa, 0xbc, 0xcf],
} as const;

type RGB = readonly [number, number, number];

function srgbToLinear(c: number) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function mulberry32(a: number) {
  let t = a >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function hash2(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function vnoiseFast(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function fbm(x: number, y: number) {
  return 0.65 * vnoiseFast(x, y) + 0.35 * vnoiseFast(x * 2.17, y * 2.17);
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

function boxBlurWrapX(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const span = radius * 2 + 1;
  const wrapX = (x: number) => ((x % w) + w) % w;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -radius; x <= radius; x++) acc += src[y * w + wrapX(x)]!;
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / span;
      acc += src[y * w + wrapX(x + radius + 1)]! - src[y * w + wrapX(x - radius)]!;
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

function killThinHorizontalSeams(mask: Float32Array, w: number, h: number) {
  const copy = mask.slice();
  for (let y = 1; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const m = copy[i]!;
      const up = copy[(y - 1) * w + x]!;
      const dn = copy[(y + 1) * w + x]!;
      if (m > 0.35 && up < 0.12 && dn < 0.12) mask[i] = (up + dn) * 0.5;
    }
  }
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
    /* empty mask */
  }
  const img = ctx.getImageData(0, 0, w, h);
  const raw = new Float32Array(w * h);
  for (let i = 0; i < raw.length; i++) raw[i] = img.data[i * 4]! / 255;
  const blurred = boxBlurWrapX(raw, w, h, 1);
  killThinHorizontalSeams(blurred, w, h);
  return blurred;
}

function sampleMask(mask: Float32Array, w: number, h: number, u: number, v: number): number {
  const x = ((((u % 1) + 1) % 1) * w);
  const y = clamp(v, 0, 0.999999) * (h - 1);
  const x0 = Math.floor(x) % w;
  const x1 = (x0 + 1) % w;
  const y0 = Math.floor(y);
  const y1 = Math.min(y0 + 1, h - 1);
  const tx = x - Math.floor(x);
  const ty = y - y0;
  return (
    mask[y0 * w + x0]! * (1 - tx) * (1 - ty) +
    mask[y0 * w + x1]! * tx * (1 - ty) +
    mask[y1 * w + x0]! * (1 - tx) * ty +
    mask[y1 * w + x1]! * tx * ty
  );
}

function fibonacciDir(i: number, n: number): [number, number, number] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - ((i + 0.5) / n) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * i;
  return [Math.cos(theta) * r, y, Math.sin(theta) * r];
}

function dirToUv(x: number, y: number, z: number): [number, number] {
  const lon = Math.atan2(-z, x);
  const lat = Math.asin(clamp(y, -1, 1));
  const u = (lon + Math.PI) / (Math.PI * 2);
  const v = (Math.PI / 2 - lat) / Math.PI;
  return [u, v];
}

function lin(rgb: RGB): [number, number, number] {
  return [srgbToLinear(rgb[0]), srgbToLinear(rgb[1]), srgbToLinear(rgb[2])];
}

function lerpRgb(a: RGB, b: RGB, t: number): [number, number, number] {
  const k = clamp(t, 0, 1);
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ];
}

function pickBaseShade(rnd: number, n: number): RGB {
  return lerpRgb(HEX.pale, HEX.bright, clamp(0.25 + rnd * 0.5 + n * 0.25, 0, 1));
}

function pickLandShade(density: number, rnd: number, n: number): RGB {
  const t = clamp(density * 0.72 + n * 0.18 + rnd * 0.1, 0, 1);
  if (t < 0.28) return lerpRgb(HEX.pale, HEX.bright, t / 0.28);
  if (t < 0.55) return lerpRgb(HEX.bright, HEX.struct, (t - 0.28) / 0.27);
  if (t < 0.82) return lerpRgb(HEX.struct, HEX.primary, (t - 0.55) / 0.27);
  return lerpRgb(HEX.primary, HEX.deep, (t - 0.82) / 0.18);
}

function pickInnerShade(rnd: number): RGB {
  return lerpRgb(HEX.pale, HEX.struct, rnd);
}

type Acc = { p: number[]; c: number[]; s: number[]; d: number[]; k: number[] };

function acc(): Acc {
  return { p: [], c: [], s: [], d: [], k: [] };
}

function push(
  a: Acc,
  x: number,
  y: number,
  z: number,
  radius: number,
  shade: RGB,
  size: number,
  density: number,
  seed: number,
) {
  a.p.push(x * radius, y * radius, z * radius);
  const [r, g, b] = lin(shade);
  a.c.push(r, g, b);
  a.s.push(size);
  a.d.push(density);
  a.k.push(seed);
}

function toCloud(a: Acc): StippleCloud {
  return {
    positions: new Float32Array(a.p),
    colors: new Float32Array(a.c),
    sizes: new Float32Array(a.s),
    seeds: new Float32Array(a.k),
    densities: new Float32Array(a.d),
    count: a.d.length,
  };
}

export function detectDeviceTier(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 720 || window.innerHeight < 480) return "mobile";
  if (w < 1100) return "tablet";
  return "desktop";
}

export function layerBudgets(tier: "mobile" | "tablet" | "desktop") {
  if (tier === "mobile") return { base: 28000, land: 38000, inner: 12000 };
  if (tier === "tablet") return { base: 70000, land: 90000, inner: 28000 };
  return { base: 140000, land: 180000, inner: 55000 };
}

let cached: StudioParticles | null = null;
let cachedKey = "";

function isNorthAmerica(x: number, y: number, z: number) {
  const lon = (Math.atan2(-z, x) * 180) / Math.PI;
  const lat = (Math.asin(clamp(y, -1, 1)) * 180) / Math.PI;
  return lon > -168 && lon < -52 && lat > 15 && lat < 83;
}

export function buildStudioParticles(tier: "mobile" | "tablet" | "desktop"): StudioParticles {
  const budgets = layerBudgets(tier);
  const key = `${tier}:${budgets.base}:${budgets.land}:${budgets.inner}:na-thin`;
  if (cached && cachedKey === key) return cached;

  const mask = rasterizeLandMask(TEX_W, TEX_H);
  const rand = mulberry32(SEED);
  const base = acc();
  const land = acc();
  const inner = acc();

  const baseN = budgets.base;
  for (let i = 0; i < baseN; i++) {
    const [x0, y0, z0] = fibonacciDir(i, baseN);
    const [u, v] = dirToUv(x0, y0, z0);
    const landAmt = sampleMask(mask, TEX_W, TEX_H, u, v);
    const n = fbm(u * 18.0, v * 9.0);
    const j = 0.01;
    let x = x0 + (rand() - 0.5) * j;
    let y = y0 + (rand() - 0.5) * j;
    let z = z0 + (rand() - 0.5) * j;
    const len = Math.hypot(x, y, z) || 1;
    x /= len;
    y /= len;
    z /= len;
    const radius = 2.62 + rand() * 0.05;
    const density = 0.38 + n * 0.28 + landAmt * 0.12;
    push(base, x, y, z, radius, pickBaseShade(rand(), n), 0.22 + rand() * 0.35, density, rand());
  }

  const scan = Math.floor(budgets.land * 1.18);
  for (let i = 0; i < scan; i++) {
    const [x0, y0, z0] = fibonacciDir(i + 17, scan);
    const [u, v] = dirToUv(x0, y0, z0);
    const landAmt = sampleMask(mask, TEX_W, TEX_H, u, v);
    if (landAmt < 0.14) continue;
    const n = fbm(u * 22.0 + 4.1, v * 11.0 + 2.7);
    const density = clamp(landAmt * mix(0.55, 1.0, n), 0, 1);
    const na = isNorthAmerica(x0, y0, z0);
    if (na && rand() > 0.46) continue;
    const copies = na ? 1 : density > 0.7 ? 3 : 2;
    for (let c = 0; c < copies; c++) {
      const j = na ? 0.02 : 0.012;
      let x = x0 + (rand() - 0.5) * j;
      let y = y0 + (rand() - 0.5) * j;
      let z = z0 + (rand() - 0.5) * j;
      const len = Math.hypot(x, y, z) || 1;
      x /= len;
      y /= len;
      z /= len;
      const radius = 2.6 + rand() * 0.09;
      push(
        land,
        x,
        y,
        z,
        radius,
        pickLandShade(density, rand(), n),
        0.28 + density * 0.4 + rand() * 0.2,
        density,
        rand(),
      );
    }
  }

  const innerN = budgets.inner;
  const shells = [0.97, 0.94, 0.9];
  for (let i = 0; i < innerN; i++) {
    const [x0, y0, z0] = fibonacciDir(i + 101, innerN);
    const [u, v] = dirToUv(x0, y0, z0);
    const landAmt = sampleMask(mask, TEX_W, TEX_H, u, v);
    const n = fbm(u * 14.0, v * 7.0 + 8.0);
    if (isNorthAmerica(x0, y0, z0) && rand() > 0.58) continue;
    const shell = shells[i % 3]!;
    const j = 0.016;
    let x = x0 + (rand() - 0.5) * j;
    let y = y0 + (rand() - 0.5) * j;
    let z = z0 + (rand() - 0.5) * j;
    const len = Math.hypot(x, y, z) || 1;
    x /= len;
    y /= len;
    z /= len;
    const radius = 2.65 * shell + (n - 0.5) * 0.04;
    push(inner, x, y, z, radius, pickInnerShade(rand()), 0.2 + rand() * 0.28, 0.12 + landAmt * 0.2, rand());
  }

  cachedKey = key;
  cached = { base: toCloud(base), land: toCloud(land), internal: toCloud(inner) };
  return cached;
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
