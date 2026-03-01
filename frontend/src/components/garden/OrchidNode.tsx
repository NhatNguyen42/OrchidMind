"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import type { Note, NodePosition } from "@/lib/types";
import { getCategoryColor } from "@/lib/types";
import { useGarden } from "@/components/providers/GardenProvider";

/* ── Petal geometry (created once) ── */
function createPetalGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.12, 0.15, 0.22, 0.45, 0.06, 0.65);
  shape.bezierCurveTo(0.0, 0.72, -0.06, 0.65, -0.06, 0.65);
  shape.bezierCurveTo(-0.22, 0.45, -0.12, 0.15, 0, 0);
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.015,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
  });
}

const PETAL_GEO = createPetalGeometry();
const PETAL_COUNT = 6;
const PETAL_ANGLES = Array.from({ length: PETAL_COUNT }, (_, i) => (i / PETAL_COUNT) * Math.PI * 2);

/* ── Component ── */
interface Props {
  note: Note;
}

export function OrchidNode({ note }: Props) {
  const { selectNote, hoverNote, hoveredNoteId, selectedNote, searchResults, positions } = useGarden();
  const groupRef = useRef<THREE.Group>(null);
  const petalRefs = useRef<(THREE.Mesh | null)[]>([]);
  const lightRef = useRef<THREE.PointLight>(null);
  const [localHover, setLocalHover] = useState(false);

  const color = getCategoryColor(note.category);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  const isHovered = hoveredNoteId === note.id || localHover;
  const isSelected = selectedNote?.id === note.id;
  const isSearchHit = searchResults.includes(note.id);
  const isHighlighted = isHovered || isSelected || isSearchHit;

  /* Animate every frame via refs (no re-renders) */
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    /* Read LIVE position from the shared ref (updated by force graph each frame) */
    const pos = positions.current.get(note.id) ?? [0, 0, 0];

    /* Gentle floating motion */
    groupRef.current.position.set(
      pos[0],
      pos[1] + Math.sin(t * 0.5 + pos[0]) * 0.15,
      pos[2]
    );

    /* Scale spring */
    const targetScale = isHighlighted ? 1.3 : 1.0;
    const s = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(s, targetScale, 0.08);
    groupRef.current.scale.setScalar(newScale);

    /* Petal open/close */
    const targetAngle = isHighlighted ? -Math.PI * 0.35 : -Math.PI * 0.05;
    for (let i = 0; i < PETAL_COUNT; i++) {
      const mesh = petalRefs.current[i];
      if (!mesh) continue;
      mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetAngle, 0.06);
    }

    /* Light intensity */
    if (lightRef.current) {
      const targetIntensity = isHighlighted ? 3.0 : 1.0;
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, 0.08);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central orb */}
      <mesh
        onPointerEnter={(e) => { e.stopPropagation(); setLocalHover(true); hoverNote(note.id); }}
        onPointerLeave={() => { setLocalHover(false); hoverNote(null); }}
        onClick={(e) => { e.stopPropagation(); selectNote(note); }}
      >
        <icosahedronGeometry args={[0.22, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHighlighted ? 4 : 2}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner stamen */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={isHighlighted ? 6 : 3}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Petals */}
      {PETAL_ANGLES.map((angle, i) => (
        <mesh
          key={i}
          ref={(el) => { petalRefs.current[i] = el; }}
          geometry={PETAL_GEO}
          rotation={[
            -Math.PI * 0.05,
            angle,
            0,
          ]}
          position={[
            Math.cos(angle) * 0.15,
            0.05,
            Math.sin(angle) * 0.15,
          ]}
          onPointerEnter={(e) => { e.stopPropagation(); setLocalHover(true); hoverNote(note.id); }}
          onPointerLeave={() => { setLocalHover(false); hoverNote(null); }}
          onClick={(e) => { e.stopPropagation(); selectNote(note); }}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isHighlighted ? 2.5 : 1.2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Point light for local glow */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={1.0}
        distance={5}
        decay={2}
      />

      {/* Label */}
      <Text
        position={[0, -0.55, 0]}
        fontSize={0.18}
        color="#e2e8f0"
        anchorX="center"
        anchorY="top"
        maxWidth={3}
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {note.title}
      </Text>

      {/* Floating info card on selection */}
      {isSelected && (
        <Html center position={[0, 1.6, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div className="w-72 p-4 rounded-2xl border border-white/10 text-white pointer-events-none"
            style={{
              background: "rgba(3, 7, 18, 0.75)",
              backdropFilter: "blur(20px)",
              boxShadow: `0 0 30px ${color}30, 0 8px 32px rgba(0,0,0,0.5)`,
            }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color }}>
              {note.category}
            </p>
            <h3 className="text-sm font-bold leading-tight mb-2">{note.title}</h3>
            <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
              {note.content.slice(0, 180)}...
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {note.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: `${color}20`, color }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
