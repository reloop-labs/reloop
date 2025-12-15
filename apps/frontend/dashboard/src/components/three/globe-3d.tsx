"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Mesh, Group } from "three";
import * as THREE from "three";
import { useTheme } from "next-themes";

// Color schemes for light and dark mode based on the design system
const LIGHT_COLORS = {
  planetBase: "#f5f5f5",    // neutral-100 - ultra light base
  grid: "#ebebeb",          // neutral-200 - very subtle grid lines
  ring: "#d1d1d1x",          // neutral-100 - ultra light ring
  ringLight: "#f7f7f7",     // neutral-50 - almost white accent ring
  pointLight: "#d1d1d1",    // neutral-300 - light accent
};

const DARK_COLORS = {
  planetBase: "#737373",    // neutral-500 - lighter base for visibility on dark backgrounds
  grid: "#a3a3a3",          // neutral-400 - lighter grid lines for visibility
  ring: "#a3a3a3",          // neutral-400 - lighter ring for dark mode
  ringLight: "#d1d1d1",     // neutral-300 - lighter accent ring
  pointLight: "#f5f5f5",    // neutral-100 - light accent
};

interface PlanetProps {
  colors: typeof LIGHT_COLORS;
}

function Planet({ colors }: PlanetProps) {
  return (
    <group>
      {/* Core dark sphere */}
      <mesh>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial
          color={colors.planetBase}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Wireframe grid - the main visible element */}
      <mesh>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color={colors.grid}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}


interface Globe3DProps {
  size?: number;
  className?: string;
}

function GlobeCanvas({ colors, size = 80, className }: Globe3DProps & { colors: typeof LIGHT_COLORS }) {
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
        <pointLight position={[-2, -2, 3]} intensity={0.2} color={colors.pointLight} />
        <Planet colors={colors} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          rotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}

// Light mode globe component
export function Globe3DLight({ size = 80, className }: Globe3DProps) {
  return <GlobeCanvas colors={LIGHT_COLORS} size={size} className={className} />;
}

// Dark mode globe component
export function Globe3DDark({ size = 80, className }: Globe3DProps) {
  return <GlobeCanvas colors={DARK_COLORS} size={size} className={className} />;
}

// Auto-switching globe based on theme
export function Globe3D({ size = 80, className }: Globe3DProps) {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === "dark" ? DARK_COLORS : LIGHT_COLORS;

  return <GlobeCanvas colors={colors} size={size} className={className} />;
}
