"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useGarden } from "@/components/providers/GardenProvider";
import { OrchidNode } from "./OrchidNode";
import { VineConnection } from "./VineConnection";
import { Particles } from "./Particles";
import { CameraController } from "./CameraController";

/* ── Inner scene (runs inside Canvas) ── */
function SceneContent() {
  const { notes, connections, graphRef, positions } = useGarden();

  /* Tick the force graph every frame and store positions */
  useFrame(() => {
    if (graphRef.current) {
      graphRef.current.tick();
      positions.current = graphRef.current.getPositions();
    }
  });

  return (
    <>
      {/* Nodes */}
      {notes.map((note) => (
        <OrchidNode key={note.id} note={note} />
      ))}

      {/* Vines */}
      {connections.map((conn, i) => (
        <VineConnection key={`${conn.source_id}-${conn.target_id}-${i}`} connection={conn} />
      ))}
    </>
  );
}

/* ── Canvas wrapper ── */
export function GardenScene() {
  return (
    <Canvas
      camera={{ position: [0, 5, 18], fov: 55, near: 0.1, far: 100 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#030712"]} />

      {/* Fog for depth */}
      <fog attach="fog" args={["#030712", 15, 50]} />

      {/* Lighting */}
      <ambientLight intensity={0.08} />
      <directionalLight position={[10, 15, 10]} intensity={0.3} color="#a5b4fc" />
      <directionalLight position={[-8, 5, -10]} intensity={0.15} color="#c084fc" />

      <Suspense fallback={null}>
        <SceneContent />
        <Particles />
        {/* Post-processing (inside Suspense so failures don't kill the scene) */}
        <EffectComposer>
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette darkness={0.45} offset={0.4} />
        </EffectComposer>
      </Suspense>

      <CameraController />
    </Canvas>
  );
}
