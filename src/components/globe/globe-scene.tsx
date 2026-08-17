import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  buildNetworkCached,
  debugEnabled,
  detectMobile,
  type NetworkBuffers,
} from "./earth-network";
import { CityMarkers } from "./city-markers";
import { yawAmount, subscribeProgress, getProgress } from "@/lib/hero-scroll";

const RADIUS = 2.8;
const ROT_PERIOD = 92;
const ROT_SPEED = (Math.PI * 2) / ROT_PERIOD;

type Tunables = {
  lineOpacity: number;
  nodeSize: number;
  nodeBrightness: number;
  shadowOpacity: number;
  lightIntensity: number;
  cameraDistance: number;
  fresnel: number;
  rotationSpeed: number;
  lineColor: string;
};

const DEFAULTS: Tunables = {
  lineOpacity: 0.78,
  nodeSize: 1.05,
  nodeBrightness: 1.2,
  shadowOpacity: 0.26,
  lightIntensity: 1,
  cameraDistance: 16.8,
  fresnel: 0.14,
  rotationSpeed: 0.036,
  lineColor: "#5DAEF7",
};

const SURFACE_VS = /* glsl */ `
  attribute float aKind;
  varying float vKind;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vKind = aKind;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normalize(position));
    vView = cameraPosition - wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const SURFACE_FS = /* glsl */ `
  uniform vec3 uLand;
  uniform vec3 uOcean;
  uniform float uFresnel;
  varying float vKind;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vView);
    float facing = max(dot(N, V), 0.0);
    float land = step(0.5, vKind);
    vec3 albedo = mix(uOcean, uLand, land);
    float wrap = clamp(dot(N, normalize(vec3(-0.35, 0.72, 0.55))) * 0.28 + 0.72, 0.0, 1.0);
    float fres = pow(1.0 - facing, 2.8) * uFresnel;
    vec3 col = albedo * (0.78 + wrap * 0.28) + vec3(0.78, 0.9, 0.98) * fres;
    float alpha = mix(0.028, 0.8, land) * smoothstep(0.02, 0.35, facing) + fres * 0.1;
    gl_FragColor = vec4(col, alpha);
  }
`;

const LINE_VS = /* glsl */ `
  attribute float aKind;
  attribute vec3 aColor;
  varying float vKind;
  varying vec3 vColor;
  varying float vFacing;
  void main() {
    vKind = aKind;
    vColor = aColor;
    vec3 N = normalize(mat3(modelMatrix) * normalize(position));
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec3 V = normalize(cameraPosition - wp.xyz);
    vFacing = abs(dot(N, V));
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const LINE_FS = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uTint;
  varying float vKind;
  varying vec3 vColor;
  varying float vFacing;
  void main() {
    float land = step(0.5, vKind);
    float fade = smoothstep(0.02, 0.28, vFacing);
    float op = uOpacity * mix(0.32, 0.88, land) * fade;
    vec3 col = mix(vColor, uTint, 0.35);
    gl_FragColor = vec4(col, op);
  }
`;

const POINT_VS = /* glsl */ `
  attribute float aKind;
  uniform float uPixelRatio;
  uniform float uSize;
  varying float vKind;
  varying float vFacing;
  void main() {
    vKind = aKind;
    vec3 N = normalize(mat3(modelMatrix) * normalize(position));
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec3 V = normalize(cameraPosition - wp.xyz);
    vFacing = abs(dot(N, V));
    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    float boost = mix(0.75, 1.15, step(0.5, vKind));
    gl_PointSize = uSize * boost * uPixelRatio * (11.0 / max(4.0, -mv.z));
  }
`;

const POINT_FS = /* glsl */ `
  uniform float uBrightness;
  uniform vec3 uColor;
  varying float vKind;
  varying float vFacing;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = length(p);
    if (d > 1.0) discard;
    float a = smoothstep(1.0, 0.22, d) * smoothstep(0.05, 0.4, vFacing);
    vec3 col = uColor * uBrightness * mix(0.85, 1.12, step(0.5, vKind));
    gl_FragColor = vec4(col, a * 0.9);
  }
`;

const SHADOW_VS = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHADOW_FS = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= 0.68;
    p.y *= 1.22;
    float d = length(p);
    float a = smoothstep(1.0, 0.08, d);
    a = a * a * uOpacity;
    gl_FragColor = vec4(0.48, 0.56, 0.64, a);
  }
`;

const FRESNEL_VS = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = cameraPosition - wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRESNEL_FS = /* glsl */ `
  uniform float uFresnel;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 3.2);
    gl_FragColor = vec4(0.78, 0.9, 0.98, f * uFresnel * 0.55);
  }
`;

function hexToLinearVec(hex: string): THREE.Color {
  return new THREE.Color(hex).convertSRGBToLinear();
}

function StudioShadow({ opacity }: { opacity: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uOpacity: { value: opacity } },
        vertexShader: SHADOW_VS,
        fragmentShader: SHADOW_FS,
        transparent: true,
        depthWrite: false,
        toneMapped: true,
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(() => {
    mat.uniforms.uOpacity!.value = opacity;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.08, -RADIUS - 0.38, 0.06]} material={mat}>
      <planeGeometry args={[10.5, 7.4]} />
    </mesh>
  );
}

const BASE_VS = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = cameraPosition - wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const BASE_FS = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vView);
    vec3 L = normalize(vec3(-0.4, 0.75, 0.5));
    float wrap = dot(N, L) * 0.07 + 0.95;
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.4) * 0.045;
    vec3 col = vec3(0.995, 0.997, 1.0) * wrap + vec3(0.82, 0.91, 0.98) * fres;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function BaseSphere({ fresnel }: { fresnel: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BASE_VS,
        fragmentShader: BASE_FS,
        toneMapped: true,
      }),
    [],
  );
  const rim = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uFresnel: { value: fresnel } },
        vertexShader: FRESNEL_VS,
        fragmentShader: FRESNEL_FS,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
        toneMapped: true,
      }),
    [],
  );
  useEffect(
    () => () => {
      mat.dispose();
      rim.dispose();
    },
    [mat, rim],
  );
  useFrame(() => {
    rim.uniforms.uFresnel!.value = fresnel;
  });
  return (
    <group>
      <mesh material={mat}>
        <sphereGeometry args={[RADIUS, 64, 48]} />
      </mesh>
      <mesh material={rim} scale={1.003}>
        <sphereGeometry args={[RADIUS, 80, 56]} />
      </mesh>
    </group>
  );
}

function NetworkMesh({
  net,
  tunables,
}: {
  net: NetworkBuffers;
  tunables: Tunables;
}) {
  const { gl } = useThree();
  const land = useMemo(() => hexToLinearVec("#5DAEF7"), []);
  const ocean = useMemo(() => hexToLinearVec("#E8F2FA"), []);

  const surfaceMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uLand: { value: land },
          uOcean: { value: ocean },
          uFresnel: { value: tunables.fresnel },
        },
        vertexShader: SURFACE_VS,
        fragmentShader: SURFACE_FS,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
        toneMapped: true,
      }),
    [land, ocean, tunables.fresnel],
  );

  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uOpacity: { value: tunables.lineOpacity },
          uTint: { value: hexToLinearVec(tunables.lineColor) },
        },
        vertexShader: LINE_VS,
        fragmentShader: LINE_FS,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: true,
      }),
    [tunables.lineColor, tunables.lineOpacity],
  );

  const pointMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uPixelRatio: { value: gl.getPixelRatio() },
          uSize: { value: tunables.nodeSize },
          uBrightness: { value: tunables.nodeBrightness },
          uColor: { value: hexToLinearVec("#8CC8F6") },
        },
        vertexShader: POINT_VS,
        fragmentShader: POINT_FS,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: true,
      }),
    [gl, tunables.nodeBrightness, tunables.nodeSize],
  );

  const { surfaceGeo, lineGeo, pointGeo } = useMemo(() => {
    const surfaceGeo = new THREE.BufferGeometry();
    surfaceGeo.setAttribute("position", new THREE.BufferAttribute(net.positions, 3));
    surfaceGeo.setAttribute("aKind", new THREE.BufferAttribute(net.kinds, 1));
    surfaceGeo.setIndex(new THREE.BufferAttribute(net.faceIndex, 1));
    surfaceGeo.computeVertexNormals();

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(net.linePositions, 3));
    lineGeo.setAttribute("aKind", new THREE.BufferAttribute(net.lineKinds, 1));
    lineGeo.setAttribute("aColor", new THREE.BufferAttribute(net.lineColors, 3));

    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute("position", new THREE.BufferAttribute(net.positions, 3));
    pointGeo.setAttribute("aKind", new THREE.BufferAttribute(net.kinds, 1));
    return { surfaceGeo, lineGeo, pointGeo };
  }, [net]);

  useEffect(
    () => () => {
      surfaceGeo.dispose();
      lineGeo.dispose();
      pointGeo.dispose();
      surfaceMat.dispose();
      lineMat.dispose();
      pointMat.dispose();
    },
    [surfaceGeo, lineGeo, pointGeo, surfaceMat, lineMat, pointMat],
  );

  useFrame(() => {
    surfaceMat.uniforms.uFresnel!.value = tunables.fresnel;
    lineMat.uniforms.uOpacity!.value = tunables.lineOpacity;
    lineMat.uniforms.uTint!.value = hexToLinearVec(tunables.lineColor);
    pointMat.uniforms.uPixelRatio!.value = gl.getPixelRatio();
    pointMat.uniforms.uSize!.value = tunables.nodeSize;
    pointMat.uniforms.uBrightness!.value = tunables.nodeBrightness;
  });

  return (
    <group>
      <mesh geometry={surfaceGeo} material={surfaceMat} renderOrder={1} />
      <lineSegments geometry={lineGeo} material={lineMat} renderOrder={2} />
      <points geometry={pointGeo} material={pointMat} renderOrder={3} />
    </group>
  );
}

const USA_YAW = 0.11;

function GlobeRig({
  net,
  tunables,
}: {
  net: NetworkBuffers | null;
  tunables: Tunables;
}) {
  const spin = useRef<THREE.Group>(null);
  const parallax = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const yaw = useRef(USA_YAW);
  const yawTarget = useRef(USA_YAW);
  const touchY = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      pointer.current.x = ny * -0.042;
      pointer.current.y = nx * 0.042;
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    const unsub = subscribeProgress(() => {
      yawTarget.current = USA_YAW + yawAmount() * 3.4;
    });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      unsub();
    };
  }, []);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    yawTarget.current += tunables.rotationSpeed * d;
    const k = 1 - Math.exp(-3.1 * d);
    yaw.current += (yawTarget.current - yaw.current) * k;
    if (spin.current) spin.current.rotation.y = yaw.current;
    if (parallax.current) {
      const pk = 1 - Math.exp(-5 * d);
      parallax.current.rotation.x += (pointer.current.x - parallax.current.rotation.x) * pk;
      parallax.current.rotation.y += (pointer.current.y - parallax.current.rotation.y) * pk;
    }
  });

  return (
    <group ref={parallax} position={[0, 0.12, 0]}>
      <group ref={spin}>
        <BaseSphere fresnel={tunables.fresnel} />
        {net ? <NetworkMesh net={net} tunables={tunables} /> : null}
        <CityMarkers />
      </group>
    </group>
  );
}

function ResponsiveCamera({ distance }: { distance: number }) {
  const { camera, size } = useThree();
  const zBase = useRef(distance);
  useLayoutEffect(() => {
    const portrait = size.height / Math.max(size.width, 1) > 1.12;
    zBase.current = portrait ? distance * 1.18 : size.width < 720 ? distance * 1.08 : distance;
  }, [size, distance]);
  useFrame((_, delta) => {
    const p = getProgress();
    const d = Math.min(delta, 0.1);
    const k = 1 - Math.exp(-3.4 * d);
    const zWant = zBase.current;
    const yWant = 0.32;
    camera.position.z += (zWant - camera.position.z) * k;
    camera.position.y += (yWant - camera.position.y) * k;
    camera.lookAt(0, -0.12, 0);
  });
  return null;
}

function StudioEnv({ intensity }: { intensity: number }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new RoomEnvironment();
    const tex = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = 0.16 * intensity;
    return () => {
      scene.environment = null;
      tex.dispose();
      pmrem.dispose();
      envScene.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
}

function DevGui({ tunables }: { tunables: Tunables }) {
  useEffect(() => {
    if (!debugEnabled()) return;
    let disposed = false;
    let gui: { destroy: () => void } | null = null;
    void import("lil-gui").then(({ default: GUI }) => {
      if (disposed) return;
      const g = new GUI({ title: "Globe" });
      g.add(tunables, "lineOpacity", 0.1, 1, 0.01);
      g.addColor(tunables, "lineColor");
      g.add(tunables, "nodeSize", 0.3, 3, 0.05);
      g.add(tunables, "nodeBrightness", 0.4, 2, 0.05);
      g.add(tunables, "shadowOpacity", 0, 0.6, 0.01);
      g.add(tunables, "lightIntensity", 0.2, 2, 0.05);
      g.add(tunables, "cameraDistance", 12, 44, 0.1);
      g.add(tunables, "fresnel", 0, 0.5, 0.01);
      g.add(tunables, "rotationSpeed", 0, 0.2, 0.001);
      gui = g;
    });
    return () => {
      disposed = true;
      gui?.destroy();
    };
  }, [tunables]);
  return null;
}

function SceneContent({ net, tunables }: { net: NetworkBuffers | null; tunables: Tunables }) {
  return (
    <>
      <ResponsiveCamera distance={tunables.cameraDistance} />
      {net ? <StudioEnv intensity={tunables.lightIntensity} /> : null}
      <ambientLight intensity={0.72 * tunables.lightIntensity} color="#ffffff" />
      <hemisphereLight args={["#ffffff", "#e8eef4", 0.42 * tunables.lightIntensity]} />
      <directionalLight
        position={[-4.2, 7.5, 6.2]}
        intensity={1.15 * tunables.lightIntensity}
        color="#ffffff"
      />
      <directionalLight
        position={[5.5, 1.4, 3.2]}
        intensity={0.28 * tunables.lightIntensity}
        color="#e7f2fb"
      />
      <directionalLight
        position={[2.2, 1.6, -6.5]}
        intensity={0.32 * tunables.lightIntensity}
        color="#cfe4f6"
      />
      <group position={[0, -0.72, 0]}>
        <GlobeRig net={net} tunables={tunables} />
        <StudioShadow opacity={tunables.shadowOpacity} />
      </group>
      <DevGui tunables={tunables} />
    </>
  );
}

export function GlobeScene() {
  const [net, setNet] = useState<NetworkBuffers | null>(null);
  const tunables = useMemo(() => ({ ...DEFAULTS }), []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const mobile = detectMobile();
      setNet(
        buildNetworkCached({
          radius: RADIUS,
          landDensity: 1,
          oceanDensity: 1,
          nodeBudget: mobile ? 5000 : 10000,
        }),
      );
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.35]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.06,
        stencil: false,
      }}
      camera={{ position: [0, 0.32, 25.6], fov: 28, near: 0.2, far: 120 }}
      style={{ width: "100%", height: "100%", background: "transparent", display: "block", pointerEvents: "none" }}
      resize={{ debounce: 80 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        scene.background = null;
      }}
    >
      <SceneContent net={net} tunables={tunables} />
    </Canvas>
  );
}
