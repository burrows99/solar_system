import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SolarFlares = () => {
  const flareRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  const burstRef = useRef<number[]>([]);
  
  const flareGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const count = 30000; // Increased particle count

    // Initialize burst positions
    burstRef.current = Array(count).fill(0).map(() => Math.random() * 100);

    for (let i = 0; i < count; i++) {
      // Create a more focused distribution near the surface
      const radius = 0.95 + Math.random() * 0.15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      vertices.push(x, y, z);

      // Brighter color gradient
      const colorIntensity = Math.random();
      if (colorIntensity > 0.7) {
        colors.push(1.0, 1.0, 0.3, 1.0);
      } else if (colorIntensity > 0.4) {
        colors.push(1.0, 0.6, 0.2, 1.0);
      } else {
        colors.push(1.0, 0.3, 0.1, 1.0);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    return geometry;
  }, []);

  useFrame((state) => {
    if (flareRef.current) {
      timeRef.current += 0.01;
      
      // Rotate the flare system with some variation
      flareRef.current.rotation.y += 0.002 + Math.sin(timeRef.current * 0.5) * 0.001;
      flareRef.current.rotation.x += 0.001 + Math.cos(timeRef.current * 0.3) * 0.0005;

      // Animate particles with random bursts and loops
      const positions = flareRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Calculate distance from center
        const distance = Math.sqrt(x * x + y * y + z * z);
        
        // Random burst timing
        const burstTime = burstRef.current[i/3];
        const burstPhase = (timeRef.current + burstTime) % 100;
        
        // Burst intensity (peaks every 100 frames)
        const burstIntensity = Math.max(0, Math.sin(burstPhase * 0.1) * 2);
        
        // Add wavy motion based on time and position
        const waveFactor = Math.sin(timeRef.current + distance * 2) * 0.1;
        const randomFactor = (Math.random() - 0.5) * 0.05;
        
        // Calculate outward direction with burst effect
        const outwardSpeed = 0.03 * (1 + Math.random() * 0.5 + waveFactor + randomFactor + burstIntensity);
        
        // Add loop-like motion with reduced radius
        const loopRadius = 0.1 * (1 + Math.sin(timeRef.current * 0.5 + i) * 0.5);
        const loopAngle = timeRef.current * 2 + i * 0.1;
        
        // Update position with radial, tangential, and loop motion
        positions[i] += (x / distance * outwardSpeed) + 
                       (Math.cos(loopAngle) * loopRadius);
        positions[i + 1] += (y / distance * outwardSpeed) + 
                          (Math.sin(loopAngle) * loopRadius);
        positions[i + 2] += (z / distance * outwardSpeed) + 
                          (Math.sin(timeRef.current + i) * 0.01);

        // Reset particles that have moved too far
        if (distance > 1.2) {
          // Randomly decide if this particle should create a new burst
          if (Math.random() < 0.01) {
            burstRef.current[i/3] = timeRef.current;
          }
          
          const radius = 0.95 + Math.random() * 0.1;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          
          positions[i] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i + 2] = radius * Math.cos(phi);
        }
      }
      flareRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group scale={[5, 5, 5]}>
      {/* Main flare particles */}
      <points ref={flareRef}>
        <primitive object={flareGeometry} attach="geometry" />
        <pointsMaterial
          size={0.08} // Reduced particle size
          vertexColors
          transparent
          opacity={1.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial
          color={0xff9900}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default SolarFlares; 