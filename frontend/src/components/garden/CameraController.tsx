"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useGarden } from "@/components/providers/GardenProvider";

export function CameraController() {
  const { selectedNote, positions } = useGarden();
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const hasFlown = useRef(false);
  const prevSelectedId = useRef<string | null>(null);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (selectedNote) {
      const livePos = positions.current.get(selectedNote.id);
      if (!livePos) return;
      const target = new THREE.Vector3(...livePos);

      /* On first selection (or switching notes), fly camera to a good vantage point */
      if (prevSelectedId.current !== selectedNote.id) {
        prevSelectedId.current = selectedNote.id;
        hasFlown.current = false;
      }

      if (!hasFlown.current) {
        /* Fly camera position toward the node — only until close enough */
        const dest = target.clone().add(new THREE.Vector3(1.5, 1.0, 3.5));
        camera.position.lerp(dest, 0.06);
        if (camera.position.distanceTo(dest) < 0.3) {
          hasFlown.current = true; /* stop moving the camera — user is free to zoom/rotate */
        }
      }

      /* ALWAYS keep the look-at target tracking the node so it stays centered */
      controlsRef.current.target.lerp(target, 0.06);
      controlsRef.current.update();
    } else {
      prevSelectedId.current = null;
      hasFlown.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={40}
      autoRotate={!selectedNote}
      autoRotateSpeed={0.15}
    />
  );
}
