import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { lonLatToPosition } from "./earth-network";

const SURFACE = 2.646;

export type CityPin = {
  name: string;
  lon: number;
  lat: number;
  address: string;
  kind: "hq" | "office" | "presence";
};

export const CITIES: CityPin[] = [
  {
    name: "Brampton",
    lon: -79.7624,
    lat: 43.7315,
    address: "373 Steeles Ave W, Brampton, ON L6Y 0P8",
    kind: "hq",
  },
  {
    name: "Ottawa",
    lon: -75.6972,
    lat: 45.4215,
    address: "879 Antonio Farley St, Ottawa, ON K4A 5K1",
    kind: "office",
  },
  {
    name: "Kitchener",
    lon: -80.4925,
    lat: 43.4516,
    address: "34 Commonwealth St, Kitchener, ON N2E 4K2",
    kind: "office",
  },
  {
    name: "Brantford",
    lon: -80.2644,
    lat: 43.1394,
    address: "Brantford, ON",
    kind: "office",
  },
  {
    name: "Montreal",
    lon: -73.5673,
    lat: 45.5017,
    address: "Montreal, QC",
    kind: "office",
  },
  {
    name: "Frankfort",
    lon: -84.8733,
    lat: 38.2009,
    address: "Frankfort, Kentucky",
    kind: "presence",
  },
  {
    name: "Harrisburg",
    lon: -76.8867,
    lat: 40.2732,
    address: "Harrisburg, Pennsylvania",
    kind: "presence",
  },
  {
    name: "Carson City",
    lon: -119.7674,
    lat: 39.1638,
    address: "Carson City, Nevada",
    kind: "presence",
  },
  {
    name: "Sacramento",
    lon: -121.4944,
    lat: 38.5816,
    address: "Sacramento, California",
    kind: "presence",
  },
  {
    name: "Sydney",
    lon: 151.2093,
    lat: -33.8688,
    address: "Sydney, NSW, Australia",
    kind: "office",
  },
  {
    name: "Melbourne",
    lon: 144.9631,
    lat: -37.8136,
    address: "Melbourne, VIC, Australia",
    kind: "office",
  },
  {
    name: "Auckland",
    lon: 174.7645,
    lat: -36.8509,
    address: "Auckland, New Zealand",
    kind: "presence",
  },
];

function emberSize(kind: CityPin["kind"]) {
  if (kind === "hq") return 0.03;
  if (kind === "office") return 0.02;
  return 0.015;
}

function EmberDot({ city }: { city: CityPin }) {
  const pos = lonLatToPosition(city.lon, city.lat, SURFACE);
  const r = emberSize(city.kind);
  return (
    <mesh position={pos} renderOrder={9}>
      <sphereGeometry args={[r, 16, 12]} />
      <meshBasicMaterial color="#e10600" toneMapped={false} />
    </mesh>
  );
}

function LeaderLayer() {
  const root = useRef<THREE.Group>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  const { camera, size, gl } = useThree();
  const world = useMemo(() => new THREE.Vector3(), []);
  const center = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const locals = useMemo(
    () => CITIES.map((c) => new THREE.Vector3(...lonLatToPosition(c.lon, c.lat, SURFACE))),
    [],
  );
  const host = gl.domElement.parentElement;

  useEffect(() => {
    if (!host) return;
    const layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    layer.setAttribute("class", "globe-leaders");
    layer.setAttribute("aria-hidden", "true");
    host.appendChild(layer);
    svg.current = layer;
    return () => {
      layer.remove();
      svg.current = null;
    };
  }, [host]);

  useFrame(() => {
    const group = root.current;
    const layer = svg.current;
    if (!group || !layer || !host) return;
    const w = host.clientWidth || size.width;
    const h = host.clientHeight || size.height;
    layer.setAttribute("viewBox", `0 0 ${w} ${h}`);
    layer.setAttribute("width", String(w));
    layer.setAttribute("height", String(h));

    group.updateWorldMatrix(true, false);
    group.getWorldPosition(center);

    type Mark = {
      x: number;
      y: number;
      lx: number;
      ly: number;
      city: CityPin;
      depth: number;
    };
    const ranked: Mark[] = [];

    for (let i = 0; i < CITIES.length; i++) {
      world.copy(locals[i]!).applyMatrix4(group.matrixWorld);
      projected.copy(world).project(camera);
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-projected.y * 0.5 + 0.5) * h;
      const depth = camera.position.distanceToSquared(world);
      const front =
        projected.z < 1 &&
        x > 10 &&
        x < w - 10 &&
        y > 10 &&
        y < h - 10 &&
        depth + 0.4 < camera.position.distanceToSquared(center);
      if (!front) continue;
      const vx = x - w * 0.5;
      const vy = y - h * 0.5;
      const len = Math.hypot(vx, vy) || 1;
      const reach = CITIES[i]!.kind === "hq" ? 46 : CITIES[i]!.kind === "office" ? 38 : 30;
      ranked.push({
        x,
        y,
        lx: x + (vx / len) * reach,
        ly: y + (vy / len) * reach,
        city: CITIES[i]!,
        depth,
      });
    }

    ranked.sort((a, b) => {
      if (a.city.kind === "hq" && b.city.kind !== "hq") return -1;
      if (b.city.kind === "hq" && a.city.kind !== "hq") return 1;
      return a.depth - b.depth;
    });

    const kept: Mark[] = [];
    for (const mark of ranked) {
      const clash = kept.some((other) => {
        const dx = other.lx - mark.lx;
        const dy = other.ly - mark.ly;
        return dx * dx + dy * dy < 52 * 52;
      });
      if (!clash) kept.push(mark);
    }

    layer.innerHTML = kept
      .map(
        (m) =>
          `<g class="globe-leader globe-leader-${m.city.kind}">
            <line x1="${m.x.toFixed(1)}" y1="${m.y.toFixed(1)}" x2="${m.lx.toFixed(1)}" y2="${m.ly.toFixed(1)}" />
            <text x="${m.lx.toFixed(1)}" y="${m.ly.toFixed(1)}" dx="${m.lx >= m.x ? 6 : -6}" dy="0.35em" text-anchor="${m.lx >= m.x ? "start" : "end"}">${m.city.name}</text>
          </g>`,
      )
      .join("");
  });

  return <group ref={root} />;
}

export function CityMarkers() {
  return (
    <group>
      {CITIES.map((city) => (
        <EmberDot key={city.name} city={city} />
      ))}
      <LeaderLayer />
    </group>
  );
}
