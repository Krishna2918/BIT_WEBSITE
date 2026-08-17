import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function MarkCard() {
  const group = useRef<THREE.Group>(null);
  const tex = useLoader(THREE.TextureLoader, "/images/bit-hero-cut.png?v=iso");
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  }, [tex]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.55) * 0.22;
    group.current.rotation.x = Math.sin(t * 0.27) * 0.04;
    group.current.rotation.z = 0;
  });

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[2.55, 2.55]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.55, 2.55]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function GlassMark() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
        toneMapping: THREE.NoToneMapping,
        stencil: false,
      }}
      camera={{ position: [0, 0, 3.15], fov: 32, near: 0.1, far: 20 }}
      style={{ width: "100%", height: "100%", display: "block", background: "transparent", pointerEvents: "none" }}
      resize={{ debounce: 80 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000", 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Suspense fallback={null}>
        <MarkCard />
      </Suspense>
    </Canvas>
  );
}
