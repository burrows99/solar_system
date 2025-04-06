import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const Label = ({ name, position }: { name: string; position: THREE.Vector3 }) => {
  return (
    <Html
      position={[position.x, position.y + 1, position.z]}
      center
      occlude
      style={{
        transition: 'all 0.2s',
        opacity: 1,
        transform: 'scale(1)',
      }}
    >
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        padding: '4px 8px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '12px',
        fontFamily: 'Arial',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        {name}
      </div>
    </Html>
  );
};

interface SpaceEffectsProps {
  isPlaying: boolean;
}

const SpaceEffects = ({ isPlaying }: SpaceEffectsProps) => {
  const flareRef = useRef<THREE.Points>(null);
  const cometRef = useRef<THREE.Mesh>(null);
  const cometTrailRef = useRef<THREE.Points>(null);
  const [cometPosition, setCometPosition] = useState(new THREE.Vector3());
  const timeRef = useRef(Math.random() * 100);

  // Create solar flare particles
  const flareGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const count = 2000;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = Math.random() * 3 + 1;

      const x = Math.sin(phi) * Math.cos(theta) * radius;
      const y = Math.sin(phi) * Math.sin(theta) * radius;
      const z = Math.cos(phi) * radius;

      vertices.push(x, y, z);
      colors.push(1, 0.8, 0.2, 0.8);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    return geometry;
  }, []);

  // Create comet trail
  const cometTrailGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
      const x = i * 0.1;
      const y = 0; // Remove the wave effect for a straight tail
      const z = 0;

      vertices.push(x, y, z);
      colors.push(0.2, 0.6, 1, 1 - i / count);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    return geometry;
  }, []);

  // Create comet
  const cometGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.3, 16, 16);
  }, []);

  const cometMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.8,
    });
  }, []);

  useFrame((state) => {
    if (!isPlaying) return;
    
    const time = state.clock.getElapsedTime();
    
    // Animate solar flares
    if (flareRef.current) {
      flareRef.current.rotation.y += 0.001;
      flareRef.current.rotation.x += 0.0005;
    }

    // Animate comet
    if (cometRef.current && cometTrailRef.current) {
      const orbitRadius = 30;
      const orbitSpeed = 0.2;
      const x = Math.cos(time * orbitSpeed) * orbitRadius;
      const y = Math.sin(time * orbitSpeed) * orbitRadius * 0.5;
      const z = Math.sin(time * orbitSpeed) * orbitRadius;

      // Calculate tangent vector (direction of motion)
      const tx = -Math.sin(time * orbitSpeed);
      const ty = Math.cos(time * orbitSpeed) * 0.5;
      const tz = Math.cos(time * orbitSpeed);

      // Set comet position
      const newPosition = new THREE.Vector3(x, y, z);
      cometRef.current.position.copy(newPosition);
      cometTrailRef.current.position.copy(newPosition);
      setCometPosition(newPosition);

      // Make trail point in the tangent direction (away from sun)
      const angle = Math.atan2(tx, tz);
      cometTrailRef.current.rotation.y = angle;
    }
  });

  return (
    <group>
      {/* Solar Flare */}
      <points ref={flareRef} position={[0, 0, 0]}>
        <primitive object={flareGeometry} attach="geometry" />
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Comet */}
      <group>
        <mesh
          ref={cometRef}
          geometry={cometGeometry}
          material={cometMaterial}
        />
        <Label name="Halley's Comet" position={cometPosition} />
      </group>

      {/* Comet Trail */}
      <points ref={cometTrailRef}>
        <primitive object={cometTrailGeometry} attach="geometry" />
        <pointsMaterial
          size={0.2}
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default SpaceEffects; 