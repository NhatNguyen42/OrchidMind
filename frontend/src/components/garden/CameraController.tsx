"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useGarden } from "@/components/providers/GardenProvider";

export function CameraController() {
  const { cameraTarget, setCameraTarget } = useGarden();
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!cameraTarget || !controlsRef.current) return;

    const target = new THREE.Vector3(...cameraTarget);
    const cameraOffset = target.clone().add(new THREE.Vector3(2, 1.5, 4));

    camera.position.lerp(cameraOffset, 0.03);
    controlsRef.current.target.lerp(target, 0.03);
    controlsRef.current.update();

    /* Stop tracking once close enough */
    if (camera.position.distanceTo(cameraOffset) < 0.1) {
      setCameraTarget(null);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={40}
      autoRotate
      autoRotateSpeed={0.15}
    />
  );
}
