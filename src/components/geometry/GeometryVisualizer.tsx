'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, ContactShadows, Text } from '@react-three/drei';

type ShapeType = 'cylinder' | 'cone' | 'sphere' | 'cube' | 'pyramid';

interface GeometryVisualizerProps {
  shape: ShapeType;
  color?: string;
  wireframe?: boolean;
}

function GeometryShape({ shape, color = '#6366f1', wireframe = false }: GeometryVisualizerProps) {
  const materialProps = {
    color: color,
    roughness: 0.2,
    metalness: 0.1,
    wireframe: wireframe,
  };

  switch (shape) {
    case 'cube':
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    case 'sphere':
      return (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    case 'cylinder':
      return (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 3, 64]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    case 'cone':
      return (
        <mesh castShadow receiveShadow>
          <coneGeometry args={[1.5, 3, 64]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    case 'pyramid':
      return (
        <mesh castShadow receiveShadow>
          <coneGeometry args={[1.5, 3, 4]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    default:
      return null;
  }
}

export function GeometryVisualizer({ shape, color, wireframe }: GeometryVisualizerProps) {
  return (
    <div className="w-full h-full min-h-[300px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner cursor-grab active:cursor-grabbing">
      {/* Overlay Instructions */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-white font-bold text-lg drop-shadow-md capitalize">{shape}</h3>
        <p className="text-slate-300 text-sm drop-shadow-md">Drag to rotate • Scroll to zoom</p>
      </div>

      <Canvas shadows camera={{ position: [4, 3, 5], fov: 45 }}>
        <Suspense fallback={null}>
          {/* Lighting & Environment */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} castShadow intensity={1.5} shadow-mapSize={[1024, 1024]} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
          
          <Stage environment="city" intensity={0.5} adjustCamera={false}>
            <GeometryShape shape={shape} color={color} wireframe={wireframe} />
          </Stage>
          
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
