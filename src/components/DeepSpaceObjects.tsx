import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DeepSpaceObjects = () => {
  // Oort Cloud (spherical cloud of icy objects at ~2000-100,000 AU)
  const oortCloudGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const count = 3000; // Increased count

    for (let i = 0; i < count; i++) {
      // Create a spherical distribution (not a disk like Kuiper Belt)
      const radius = 60 + Math.random() * 30; // Brought closer
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      vertices.push(x, y, z);
      // Increased brightness for distant icy bodies
      colors.push(0.8, 0.9, 1.0, 0.4);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    return geometry;
  }, []);

  // Visible Deep Space Objects
  const createNebulaGeometry = (size: number, density: number) => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    for (let i = 0; i < density; i++) {
      const radius = size * (0.8 + Math.random() * 0.4);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  };

  // Create visible nebulae and galaxies with closer positions
  const orionNebulaGeometry = useMemo(() => createNebulaGeometry(80, 2000), []);
  const andromedaGeometry = useMemo(() => createNebulaGeometry(100, 3000), []);
  const pleidesGeometry = useMemo(() => createNebulaGeometry(60, 1000), []);

  const oortCloudRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (oortCloudRef.current) {
      oortCloudRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group>
      {/* Oort Cloud */}
      <points ref={oortCloudRef}>
        <primitive object={oortCloudGeometry} attach="geometry" />
        <pointsMaterial
          size={0.2}
          vertexColors
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Orion Nebula (M42) - One of the brightest and most visible nebulae */}
      <points position={[80, 30, -60]}>
        <primitive object={orionNebulaGeometry} attach="geometry" />
        <pointsMaterial
          size={0.3}
          color={new THREE.Color(0.9, 0.5, 0.8)}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Andromeda Galaxy (M31) - Our nearest major galaxy */}
      <points position={[-90, 40, 70]}>
        <primitive object={andromedaGeometry} attach="geometry" />
        <pointsMaterial
          size={0.25}
          color={new THREE.Color(1.0, 0.9, 0.7)}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Pleiades (M45) - Visible star cluster with nebulosity */}
      <points position={[60, -20, 70]}>
        <primitive object={pleidesGeometry} attach="geometry" />
        <pointsMaterial
          size={0.25}
          color={new THREE.Color(0.7, 0.9, 1.0)}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default DeepSpaceObjects; 