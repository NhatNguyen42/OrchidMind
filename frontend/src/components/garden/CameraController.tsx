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

  useFrame(() => {
    if (!controlsRef.current) return;

    /* Continuously track selected note's LIVE position */
    if (selectedNote) {
      const livePos = positions.current.get(selectedNote.id);
      if (livePos) {
        const target = new THREE.Vector3(...livePos);
        const offset = target.clone().add(new THREE.Vector3(1.5, 1.0, 3.5));

        camera.position.lerp(offset, 0.04);
        controlsRef.current.target.lerp(target, 0.04);
        controlsRef.current.update();
      }
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
