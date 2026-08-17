import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { lonLatToPosition } from "./earth-network";

const MARKER_RADIUS = 2.828;

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

const MARKER_VS = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uTime;
  varying float vFacing;
  varying float vPulse;
  void main() {
    vec3 N = normalize(mat3(modelMatrix) * normalize(position));
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec3 V = normalize(cameraPosition - wp.xyz);
    vFacing = dot(N, V);
    vPulse = 0.72 + 0.28 * sin(uTime * 2.55);
    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (6.8 + 5.2 * vPulse) * uPixelRatio * (16.0 / max(5.0, -mv.z));
  }
`;

const MARKER_FS = /* glsl */ `
  varying float vFacing;
  varying float vPulse;
  void main() {
    if (vFacing < 0.05) discard;
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = length(p);
    if (d > 1.0) discard;
    float halo = exp(-d * d * 2.4);
    float mid = smoothstep(0.62, 0.18, d);
    float core = smoothstep(0.34, 0.0, d);
    vec3 col = mix(vec3(0.78, 0.05, 0.08), vec3(1.0, 0.38, 0.22), mid);
    col = mix(col, vec3(1.0, 0.86, 0.62), core);
    float a = (halo * 0.48 * vPulse + mid * 0.55 + core) * smoothstep(0.05, 0.22, vFacing);
    gl_FragColor = vec4(col, a);
  }
`;

type Projected = {
  x: number;
  y: number;
  front: boolean;
  depth: number;
  city: CityPin;
};

function PinLayer() {
  const group = useRef<THREE.Group>(null);
  const els = useRef<HTMLDivElement[]>([]);
  const { camera, size, gl } = useThree();
  const world = useMemo(() => new THREE.Vector3(), []);
  const center = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const locals = useMemo(
    () => CITIES.map((c) => new THREE.Vector3(...lonLatToPosition(c.lon, c.lat, MARKER_RADIUS + 0.05))),
    [],
  );
  const host = gl.domElement.parentElement;

  useEffect(() => {
    if (!host) return;
    const layer = document.createElement("div");
    layer.className = "globe-pin-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = CITIES.map(
      (city) =>
        `<div class="globe-pin globe-pin-${city.kind}"><span class="globe-pin-dot"></span><span class="globe-pin-copy"><strong>${city.name}</strong><em>${city.address}</em></span></div>`,
    ).join("");
    host.appendChild(layer);
    els.current = [...layer.querySelectorAll(".globe-pin")] as HTMLDivElement[];
    return () => {
      layer.remove();
      els.current = [];
    };
  }, [host]);

  useFrame(() => {
    const root = group.current;
    if (!root || !host || els.current.length === 0) return;
    const w = host.clientWidth || size.width;
    const h = host.clientHeight || size.height;
    root.updateWorldMatrix(true, false);
    root.getWorldPosition(center);
    const ranked: (Projected & { i: number })[] = [];
    for (let i = 0; i < CITIES.length; i++) {
      world.copy(locals[i]!).applyMatrix4(root.matrixWorld);
      projected.copy(world).project(camera);
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-projected.y * 0.5 + 0.5) * h;
      const depth = camera.position.distanceToSquared(world);
      const front =
        projected.z < 1 &&
        x > 8 &&
        x < w - 8 &&
        y > 8 &&
        y < h - 8 &&
        depth + 0.35 < camera.position.distanceToSquared(center);
      ranked.push({ x, y, front, depth, city: CITIES[i]!, i });
    }

    const visible: typeof ranked = [];
    const ordered = [...ranked].sort((a, b) => {
      if (a.city.kind === "hq" && b.city.kind !== "hq") return -1;
      if (b.city.kind === "hq" && a.city.kind !== "hq") return 1;
      return a.depth - b.depth;
    });

    for (const pin of ordered) {
      if (!pin.front) continue;
      const clash = visible.some((other) => {
        const dx = other.x - pin.x;
        const dy = other.y - pin.y;
        return dx * dx + dy * dy < 86 * 86;
      });
      if (!clash) visible.push(pin);
    }

    const shown = new Set(visible.map((p) => p.i));
    for (const pin of ranked) {
      const el = els.current[pin.i];
      if (!el) continue;
      const on = shown.has(pin.i);
      el.style.transform = `translate(${pin.x}px, ${pin.y}px) translate(-50%, -130%)`;
      el.style.opacity = on ? "1" : "0";
      el.style.visibility = on ? "visible" : "hidden";
    }
  });

  return <group ref={group} />;
}

export function CityMarkers() {
  const { gl } = useThree();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uPixelRatio: { value: gl.getPixelRatio() },
          uTime: { value: 0 },
        },
        vertexShader: MARKER_VS,
        fragmentShader: MARKER_FS,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
      }),
    [gl],
  );

  const geo = useMemo(() => {
    const positions = new Float32Array(CITIES.length * 3);
    CITIES.forEach((c, i) => {
      const [x, y, z] = lonLatToPosition(c.lon, c.lat, MARKER_RADIUS);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );

  useFrame(({ clock }) => {
    mat.uniforms.uPixelRatio!.value = gl.getPixelRatio();
    mat.uniforms.uTime!.value = clock.elapsedTime;
  });

  return (
    <group>
      <points geometry={geo} material={mat} renderOrder={8} frustumCulled={false} />
      <PinLayer />
    </group>
  );
}
