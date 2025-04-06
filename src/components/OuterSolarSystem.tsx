import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OuterSolarSystemProps {
  isPlaying: boolean;
}

const OuterSolarSystem = ({ isPlaying }: OuterSolarSystemProps) => {
  const kuiperBeltRef = useRef<THREE.Points>(null);
  
  // Create Kuiper Belt (30-50 AU, mostly icy bodies)
  const kuiperBeltGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const count = 3000;

    for (let i = 0; i < count; i++) {
      // Kuiper belt extends from ~30 AU to ~50 AU
      const radius = (30 + Math.random() * 20) * 1.5; // Scaled for visualization
      const theta = Math.random() * Math.PI * 2;
      // Kuiper belt objects are distributed in a disk, but with more inclination than asteroid belt
      const height = (Math.random() - 0.5) * 5; 

      const x = Math.cos(theta) * radius;
      const y = height;
      const z = Math.sin(theta) * radius;

      vertices.push(x, y, z);
      // Icy blue-white colors for Kuiper belt objects
      colors.push(0.8, 0.9, 1.0, 0.6);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    return geometry;
  }, []);

  // Create dwarf planets
  const dwarfPlanetGeometry = useMemo(() => new THREE.SphereGeometry(0.3, 32, 32), []);
  const dwarfPlanetMaterial = useMemo(() => new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    shininess: 5,
  }), []);

  useFrame(() => {
    if (!isPlaying) return;

    // Rotate Kuiper Belt slowly
    if (kuiperBeltRef.current) {
      kuiperBeltRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group>
      {/* Kuiper Belt */}
      <points ref={kuiperBeltRef}>
        <primitive object={kuiperBeltGeometry} attach="geometry" />
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Pluto (Dwarf Planet) - Average distance ~39.5 AU */}
      <mesh
        position={[39.5 * 1.5, 2, 0]}
        geometry={dwarfPlanetGeometry}
        material={dwarfPlanetMaterial}
      />

      {/* Eris (Dwarf Planet) - Average distance ~67.7 AU */}
      <mesh
        position={[67.7 * 1.5, 4, 0]}
        geometry={dwarfPlanetGeometry}
        material={dwarfPlanetMaterial}
      />

      {/* Haumea (Dwarf Planet) - Average distance ~43.2 AU */}
      <mesh
        position={[43.2 * 1.5, -1, 0]}
        geometry={dwarfPlanetGeometry}
        material={dwarfPlanetMaterial}
      />

      {/* Makemake (Dwarf Planet) - Average distance ~45.8 AU */}
      <mesh
        position={[45.8 * 1.5, 1, 0]}
        geometry={dwarfPlanetGeometry}
        material={dwarfPlanetMaterial}
      />
    </group>
  );
};

export default OuterSolarSystem; 