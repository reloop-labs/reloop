"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh, Group } from "three";
import * as THREE from "three";

// Neutral/gray color scheme matching API keys empty state
const COLORS = {
  planetBase: "#404040",    // dark base
  grid: "#737373",          // grid lines
  ring: "#525252",          // ring color
  ringLight: "#a3a3a3",     // lighter ring accent
};

function Planet() {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Rotate left to right (positive Y rotation)
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core dark sphere */}
      <mesh>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial
          color={COLORS.planetBase}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Wireframe grid - the main visible element */}
      <mesh>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color={COLORS.grid}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

function OrbitRing() {
  // This ring tilts and passes through the globe
  // Using a ring geometry centered on the sphere

  return (
    <group rotation={[0.5, 0.2, -0.4]}>
      {/* Main orbit ring - passes through the globe */}
      <mesh>
        <torusGeometry args={[1.15, 0.04, 16, 100]} />
        <meshStandardMaterial
          color={COLORS.ring}
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>
      {/* Thinner inner accent ring */}
      <mesh>
        <torusGeometry args={[1.0, 0.015, 12, 100]} />
        <meshBasicMaterial
          color={COLORS.ringLight}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

interface Globe3DProps {
  size?: number;
  className?: string;
}

export function Globe3D({ size = 80, className }: Globe3DProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 5]} intensity={0.6} />
        <pointLight position={[-2, -2, 3]} intensity={0.2} color="#e5e5e5" />
        <Planet />
        <OrbitRing />
      </Canvas>
    </div>
  );
}
