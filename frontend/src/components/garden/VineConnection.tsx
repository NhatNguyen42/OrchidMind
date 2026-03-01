"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Connection, NodePosition } from "@/lib/types";
import { getCategoryColor } from "@/lib/types";
import { useGarden } from "@/components/providers/GardenProvider";

/* ── Inline vine shader ── */
const vineVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const vineFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    float pulse = sin((vUv.x * 12.0) - uTime * 1.8) * 0.5 + 0.5;
    pulse = smoothstep(0.25, 0.75, pulse);
    float edge = 1.0 - pow(abs(vUv.y - 0.5) * 2.0, 1.5);
    float alpha = (0.08 + pulse * 0.35) * edge * uStrength;
    vec3 col = uColor * (0.4 + pulse * 0.6);
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ── Component ── */
interface Props {
  connection: Connection;
}

export function VineConnection({ connection }: Props) {
  const { positions, notes, hoveredNoteId, selectedNote } = useGarden();
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const sourceNote = notes.find((n) => n.id === connection.source_id);
  const targetNote = notes.find((n) => n.id === connection.target_id);
  const color1 = getCategoryColor(sourceNote?.category ?? "general");
  const color2 = getCategoryColor(targetNote?.category ?? "general");
  const mixedColor = useMemo(() => {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return c1.lerp(c2, 0.5);
  }, [color1, color2]);

  const isRelated =
    hoveredNoteId === connection.source_id ||
    hoveredNoteId === connection.target_id ||
    selectedNote?.id === connection.source_id ||
    selectedNote?.id === connection.target_id;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: mixedColor },
      uStrength: { value: connection.strength },
    }),
    [mixedColor, connection.strength]
  );

  useFrame((state) => {
    if (!meshRef.current || !matRef.current) return;

    const p = positions.current;
    const src = p.get(connection.source_id);
    const tgt = p.get(connection.target_id);
    if (!src || !tgt) return;

    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uStrength.value = THREE.MathUtils.lerp(
      matRef.current.uniforms.uStrength.value,
      isRelated ? Math.min(connection.strength * 2, 1) : connection.strength,
      0.05
    );

    /* Rebuild tube geometry from current positions */
    const start = new THREE.Vector3(...src);
    const end = new THREE.Vector3(...tgt);
    const mid = start.clone().lerp(end, 0.5);
    // Offset control point perpendicular to the line for organic curve
    const dir = end.clone().sub(start).normalize();
    const perp = new THREE.Vector3(-dir.z, dir.y * 0.3 + 0.5, dir.x).normalize();
    mid.add(perp.multiplyScalar(start.distanceTo(end) * 0.15));

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.025, 6, false);
    meshRef.current.geometry.dispose();
    meshRef.current.geometry = tubeGeo;
  });

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0)), 24, 0.025, 6, false]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vineVert}
        fragmentShader={vineFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
