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
  const nodes = useRef<{ g: SVGGElement; line: SVGLineElement; text: SVGTextElement }[]>([]);
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
    const built = CITIES.map((city) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", `globe-leader globe-leader-${city.kind}`);
      g.style.display = "none";
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.textContent = city.name;
      g.append(line, text);
      layer.appendChild(g);
      return { g, line, text };
    });
    host.appendChild(layer);
    svg.current = layer;
    nodes.current = built;
    return () => {
      layer.remove();
      svg.current = null;
      nodes.current = [];
    };
  }, [host]);

  useFrame(() => {
    const group = root.current;
    const layer = svg.current;
    const marks = nodes.current;
    if (!group || !layer || !host || marks.length === 0) return;
    const w = host.clientWidth || size.width;
    const h = host.clientHeight || size.height;
    if (layer.viewBox.baseVal.width !== w || layer.viewBox.baseVal.height !== h) {
      layer.setAttribute("viewBox", `0 0 ${w} ${h}`);
      layer.setAttribute("width", String(w));
      layer.setAttribute("height", String(h));
    }

    group.updateWorldMatrix(true, false);
    group.getWorldPosition(center);
    const cx = w * 0.5;
    const cy = h * 0.5;
    const shown: { i: number; x: number; y: number; lx: number; ly: number; depth: number }[] = [];

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
      const vx = x - cx;
      const vy = y - cy;
      const len = Math.hypot(vx, vy) || 1;
      const city = CITIES[i]!;
      const reach = city.kind === "hq" ? 88 : city.kind === "office" ? 74 : 62;
      shown.push({
        i,
        x,
        y,
        lx: x + (vx / len) * reach,
        ly: y + (vy / len) * reach,
        depth,
      });
    }

    shown.sort((a, b) => {
      const ka = CITIES[a.i]!.kind === "hq" ? 0 : 1;
      const kb = CITIES[b.i]!.kind === "hq" ? 0 : 1;
      return ka - kb || a.depth - b.depth;
    });

    const kept = new Set<number>();
    const placed: typeof shown = [];
    for (const mark of shown) {
      const clash = placed.some((other) => {
        const dx = other.lx - mark.lx;
        const dy = other.ly - mark.ly;
        return dx * dx + dy * dy < 52 * 52;
      });
      if (clash) continue;
      placed.push(mark);
      kept.add(mark.i);
    }

    for (let i = 0; i < marks.length; i++) {
      const node = marks[i]!;
      const mark = placed.find((p) => p.i === i);
      if (!mark || !kept.has(i)) {
        node.g.style.display = "none";
        continue;
      }
      node.g.style.display = "";
      node.line.setAttribute("x1", mark.x.toFixed(1));
      node.line.setAttribute("y1", mark.y.toFixed(1));
      node.line.setAttribute("x2", mark.lx.toFixed(1));
      node.line.setAttribute("y2", mark.ly.toFixed(1));
      node.text.setAttribute("x", mark.lx.toFixed(1));
      node.text.setAttribute("y", mark.ly.toFixed(1));
      node.text.setAttribute("dx", mark.lx >= mark.x ? "6" : "-6");
      node.text.setAttribute("dy", "0.35em");
      node.text.setAttribute("text-anchor", mark.lx >= mark.x ? "start" : "end");
    }
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
