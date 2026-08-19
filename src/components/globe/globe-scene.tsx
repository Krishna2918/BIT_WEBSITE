import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  buildStudioParticles,
  detectDeviceTier,
  type StippleCloud,
  type StudioParticles,
} from "./land-stipple";

const GLASS_R = 2.65;
const START_YAW = -1.05;
const ROT_SPEED = (Math.PI * 2) / 200;
const BG = "#F3F2F6";

const POINT_VS = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aSeed;
  attribute float aDensity;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uReduced;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vFacing;
  void main() {
    vColor = aColor;
    vec3 N = normalize(mat3(modelMatrix) * normalize(position));
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec3 V = normalize(cameraPosition - wp.xyz);
    vFacing = max(dot(N, V), 0.0);
    vec3 L = normalize(vec3(-0.42, 0.66, 0.52));
    float wrap = clamp(dot(N, L) * 0.42 + 0.62, 0.0, 1.0);
    float shimmer = uReduced > 0.5 ? 0.0 : 0.03 * sin(uTime * 0.31 + aSeed * 6.2831);
    vAlpha = mix(0.42, 0.95, aDensity) * mix(0.7, 1.0, vFacing) * wrap * (1.0 + shimmer);
    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    float px = mix(0.95, 1.85, clamp(aSize, 0.0, 1.0));
    gl_PointSize = px * uPixelRatio * clamp(12.4 / max(6.0, -mv.z), 0.85, 1.35);
  }
`;

const POINT_FS = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vFacing;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = length(p);
    if (d > 1.0) discard;
    float core = smoothstep(1.0, 0.32, d);
    gl_FragColor = vec4(vColor, core * vAlpha);
  }
`;

const INNER_VS = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aSeed;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uReduced;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    float shimmer = uReduced > 0.5 ? 0.0 : 0.03 * sin(uTime * 0.22 + aSeed * 5.1);
    vAlpha = 0.16 + shimmer;
    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = mix(0.7, 1.25, aSize) * uPixelRatio * clamp(11.5 / max(6.0, -mv.z), 0.8, 1.2);
  }
`;

const INNER_FS = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = length(p);
    if (d > 1.0) discard;
    float core = smoothstep(1.0, 0.28, d);
    gl_FragColor = vec4(vColor, core * vAlpha);
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
    p.x *= 0.62;
    p.y *= 1.18;
    float d = length(p);
    float a = smoothstep(1.0, 0.05, d);
    a = pow(a, 1.85) * uOpacity;
    gl_FragColor = vec4(0.314, 0.373, 0.451, a);
  }
`;

const ICE_VS = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = cameraPosition - wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const ICE_FS = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vView);
    vec3 L = normalize(vec3(-0.42, 0.7, 0.5));
    float ndl = clamp(dot(N, L) * 0.35 + 0.72, 0.0, 1.0);
    float fres = pow(1.0 - abs(dot(N, V)), 2.4);
    vec3 body = mix(vec3(0.82, 0.88, 0.94), vec3(0.90, 0.93, 0.97), ndl);
    vec3 rim = vec3(0.72, 0.82, 0.91);
    vec3 col = mix(body, rim, fres * 0.55);
    float alpha = 0.22 + fres * 0.18 + (1.0 - ndl) * 0.06;
    gl_FragColor = vec4(col, alpha);
  }
`;

function createGroundShadow() {
  return (
    <StudioShadow />
  );
}

function StudioShadow() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uOpacity: { value: 0.16 } },
        vertexShader: SHADOW_VS,
        fragmentShader: SHADOW_FS,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.04, -GLASS_R - 0.46, 0.04]} material={mat}>
      <planeGeometry args={[11.2, 7.8]} />
    </mesh>
  );
}

function createGlassSphere() {
  return <GlassSphere />;
}

function GlassSphere() {
  const back = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ICE_VS,
        fragmentShader: ICE_FS,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.BackSide,
        toneMapped: false,
      }),
    [],
  );
  const front = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ICE_VS,
        fragmentShader: ICE_FS,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.FrontSide,
        toneMapped: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      back.dispose();
      front.dispose();
    },
    [back, front],
  );
  return (
    <group>
      <mesh material={back} renderOrder={2}>
        <sphereGeometry args={[GLASS_R, 128, 96]} />
      </mesh>
      <mesh material={front} renderOrder={4}>
        <sphereGeometry args={[GLASS_R, 128, 96]} />
      </mesh>
    </group>
  );
}

function ParticleField({
  cloud,
  internal,
  reduced,
}: {
  cloud: StippleCloud;
  internal?: boolean;
  reduced: boolean;
}) {
  const { gl } = useThree();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uPixelRatio: { value: gl.getPixelRatio() },
          uTime: { value: 0 },
          uReduced: { value: reduced ? 1 : 0 },
        },
        vertexShader: internal ? INNER_VS : POINT_VS,
        fragmentShader: internal ? INNER_FS : POINT_FS,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: true,
      }),
    [gl, internal, reduced],
  );
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(cloud.positions, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(cloud.colors, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(cloud.sizes, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(cloud.seeds, 1));
    g.setAttribute("aDensity", new THREE.BufferAttribute(cloud.densities, 1));
    return g;
  }, [cloud]);

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );

  useFrame(({ clock }) => {
    mat.uniforms.uTime!.value = clock.elapsedTime;
    mat.uniforms.uPixelRatio!.value = gl.getPixelRatio();
    mat.uniforms.uReduced!.value = reduced ? 1 : 0;
  });

  return <points geometry={geo} material={mat} renderOrder={internal ? 1 : 5} />;
}

function GlobeRig({
  particles,
  reduced,
}: {
  particles: StudioParticles;
  reduced: boolean;
}) {
  const spin = useRef<THREE.Group>(null);
  const parallax = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const yaw = useRef(START_YAW);
  const yawTarget = useRef(START_YAW);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      pointer.current.x = THREE.MathUtils.degToRad(ny * -4);
      pointer.current.y = THREE.MathUtils.degToRad(nx * 10);
      pointer.current.x = THREE.MathUtils.clamp(pointer.current.x, THREE.MathUtils.degToRad(-2), THREE.MathUtils.degToRad(2));
      pointer.current.y = THREE.MathUtils.clamp(pointer.current.y, THREE.MathUtils.degToRad(-5), THREE.MathUtils.degToRad(5));
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    if (!reduced) yawTarget.current += ROT_SPEED * d;
    const k = 1 - Math.exp(-2.4 * d);
    yaw.current += (yawTarget.current - yaw.current) * k;
    if (spin.current) spin.current.rotation.y = yaw.current;
    if (parallax.current) {
      const pk = 1 - Math.exp(-4.2 * d);
      const tx = reduced ? 0 : pointer.current.x;
      const ty = reduced ? 0 : pointer.current.y;
      parallax.current.rotation.x += (tx - parallax.current.rotation.x) * pk;
      parallax.current.rotation.y += (ty - parallax.current.rotation.y) * pk;
    }
  });

  return (
    <group ref={parallax} position={[0, 0.08, 0]}>
      <group ref={spin}>
        <ParticleField cloud={particles.internal} internal reduced={reduced} />
        {createGlassSphere()}
        <ParticleField cloud={particles.base} reduced={reduced} />
        <ParticleField cloud={particles.land} reduced={reduced} />
      </group>
    </group>
  );
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  const zBase = useRef(14.2);
  useLayoutEffect(() => {
    const portrait = size.height / Math.max(size.width, 1) > 1.12;
    zBase.current = portrait ? 16.4 : size.width < 720 ? 15.2 : 14.2;
  }, [size]);
  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    const k = 1 - Math.exp(-3.4 * d);
    camera.position.z += (zBase.current - camera.position.z) * k;
    camera.position.y += (0.12 - camera.position.y) * k;
    camera.lookAt(0, -0.08, 0);
  });
  return null;
}

function StudioEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new RoomEnvironment();
    const tex = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = 0.42;
    return () => {
      scene.environment = null;
      tex.dispose();
      pmrem.dispose();
      envScene.dispose();
    };
  }, [gl, scene]);
  return null;
}

function createLighting() {
  return (
    <>
      <ambientLight intensity={0.62} color="#ffffff" />
      <hemisphereLight args={["#F7F8FA", "#CBD4E1", 0.38]} />
      <directionalLight position={[-5.2, 7.2, 6.4]} intensity={1.05} color="#ffffff" />
      <directionalLight position={[6.4, 2.2, 4.1]} intensity={0.32} color="#F7F8FA" />
      <directionalLight position={[1.4, 4.8, -6.2]} intensity={0.22} color="#E8EEF4" />
    </>
  );
}

function SceneContent({
  particles,
  reduced,
}: {
  particles: StudioParticles | null;
  reduced: boolean;
}) {
  return (
    <>
      <ResponsiveCamera />
      {particles ? <StudioEnv /> : null}
      {createLighting()}
      <group position={[0, -0.18, 0]}>
        {particles ? <GlobeRig particles={particles} reduced={reduced} /> : null}
        {createGroundShadow()}
      </group>
    </>
  );
}

export function GlobeScene() {
  const [particles, setParticles] = useState<StudioParticles | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setParticles(buildStudioParticles(detectDeviceTier()));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
        stencil: false,
      }}
      camera={{ position: [0, 0.12, 14.2], fov: 32, near: 0.2, far: 80 }}
      style={{ width: "100%", height: "100%", background: "transparent", display: "block", pointerEvents: "none" }}
      resize={{ debounce: 80 }}
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0xf3f2f6, 0);
        scene.background = null;
      }}
    >
      <SceneContent particles={particles} reduced={reduced} />
    </Canvas>
  );
}
