import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'

// Moon data with real relative values (scaled for visualization)
const MOONS = {
  earth: [
    { name: 'Moon', radius: 0.3, orbitRadius: 2, orbitalPeriod: 27.3 / 365 }, // Earth's moon
  ],
  mars: [
    { name: 'Phobos', radius: 0.1, orbitRadius: 1.4, orbitalPeriod: 0.31 / 365 },
    { name: 'Deimos', radius: 0.08, orbitRadius: 1.8, orbitalPeriod: 1.26 / 365 },
  ],
  jupiter: [
    { name: 'Io', radius: 0.25, orbitRadius: 3, orbitalPeriod: 1.77 / 365 },
    { name: 'Europa', radius: 0.22, orbitRadius: 3.8, orbitalPeriod: 3.55 / 365 },
    { name: 'Ganymede', radius: 0.35, orbitRadius: 4.5, orbitalPeriod: 7.15 / 365 },
    { name: 'Callisto', radius: 0.3, orbitRadius: 5.2, orbitalPeriod: 16.69 / 365 },
  ],
  saturn: [
    { name: 'Titan', radius: 0.35, orbitRadius: 4, orbitalPeriod: 15.95 / 365 },
    { name: 'Enceladus', radius: 0.15, orbitRadius: 3, orbitalPeriod: 1.37 / 365 },
  ],
  uranus: [
    { name: 'Titania', radius: 0.2, orbitRadius: 3, orbitalPeriod: 8.71 / 365 },
    { name: 'Oberon', radius: 0.18, orbitRadius: 3.5, orbitalPeriod: 13.46 / 365 },
  ],
  neptune: [
    { name: 'Triton', radius: 0.22, orbitRadius: 3, orbitalPeriod: 5.88 / 365 },
  ],
}

// Planetary data with real relative values (scaled down for visualization)
// Rotation periods in Earth days, scaled to make visualization interesting
// Orbital periods in Earth years, scaled for visualization
const CELESTIAL_BODIES = {
  sun: { 
    radius: 5, 
    color: '#FDB813',
    rotationPeriod: 27, // Sun's rotation period in Earth days
  },
  mercury: { 
    radius: 0.8, 
    orbitRadius: 10, 
    color: '#A0522D',
    rotationPeriod: 58.6, // days
    orbitalPeriod: 0.12, // Decreased for faster revolution
  },
  venus: { 
    radius: 1.2, 
    orbitRadius: 15, 
    color: '#DEB887',
    rotationPeriod: -243, // negative because Venus rotates retrograde
    orbitalPeriod: 0.31, // Decreased for faster revolution
  },
  earth: { 
    radius: 1.4, 
    orbitRadius: 20, 
    color: '#4B8BBE',
    rotationPeriod: 1,
    orbitalPeriod: 0.5, // Decreased for faster revolution
    moons: MOONS.earth,
  },
  mars: { 
    radius: 1.1, 
    orbitRadius: 25, 
    color: '#CD5C5C',
    rotationPeriod: 1.03,
    orbitalPeriod: 0.94, // Decreased for faster revolution
    moons: MOONS.mars,
  },
  jupiter: { 
    radius: 3, 
    orbitRadius: 35, 
    color: '#DAA520',
    rotationPeriod: 0.41,
    orbitalPeriod: 5.0, // Decreased for faster revolution
    moons: MOONS.jupiter,
  },
  saturn: { 
    radius: 2.5, 
    orbitRadius: 45, 
    color: '#F4C430',
    rotationPeriod: 0.45,
    orbitalPeriod: 15.0, // Decreased for faster revolution
    moons: MOONS.saturn,
  },
  uranus: { 
    radius: 1.8, 
    orbitRadius: 55, 
    color: '#87CEEB',
    rotationPeriod: -0.72, // negative because Uranus rotates retrograde
    orbitalPeriod: 42.0, // Decreased for faster revolution
    moons: MOONS.uranus,
  },
  neptune: { 
    radius: 1.7, 
    orbitRadius: 65, 
    color: '#4169E1',
    rotationPeriod: 0.67,
    orbitalPeriod: 80.0, // Decreased for faster revolution
    moons: MOONS.neptune,
  },
}

// Scale factors to make the visualization more interesting
const ORBITAL_SPEED_FACTOR = 4.0 // Increased from 0.5 to 1.0 for faster movement
const ROTATION_SPEED_FACTOR = 0.5 // Adjust this to speed up or slow down rotation
const MOON_SPEED_FACTOR = 1 // Adjust moon orbital speeds

const NUM_ASTEROIDS = 2000 // Number of asteroids in the belt
const NUM_METEORS = 50 // Number of meteors
const ASTEROID_BELT_INNER_RADIUS = 28 // Between Mars (25) and Jupiter (35)
const ASTEROID_BELT_OUTER_RADIUS = 32
const METEOR_FIELD_SIZE = 100 // Size of the cubic space where meteors can appear

interface MoonProps {
  radius: number
  orbitRadius: number
  orbitalPeriod: number
  parentPosition: THREE.Vector3
  isPlaying: boolean
}

const Label = ({ name }: { name: string }) => {
  return (
    <Html
      position={[0, 2, 0]}
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
  )
}

const Moon = ({ radius, orbitRadius, orbitalPeriod, parentPosition, isPlaying, name }: MoonProps & { name: string }) => {
  const ref = useRef<THREE.Mesh>(null)
  const time = useRef(Math.random() * 100)
  const [position, setPosition] = useState(() => {
    const initialX = Math.sin(time.current * (2 * Math.PI * MOON_SPEED_FACTOR) / (orbitalPeriod * 365)) * orbitRadius
    const initialZ = Math.cos(time.current * (2 * Math.PI * MOON_SPEED_FACTOR) / (orbitalPeriod * 365)) * orbitRadius
    return new THREE.Vector3(parentPosition.x + initialX, parentPosition.y, parentPosition.z + initialZ)
  })

  useFrame((_state, delta) => {
    if (isPlaying) {
      time.current += delta
    }
    const orbitalSpeed = (2 * Math.PI * MOON_SPEED_FACTOR) / (orbitalPeriod * 365)
    
    const x = Math.sin(time.current * orbitalSpeed) * orbitRadius
    const z = Math.cos(time.current * orbitalSpeed) * orbitRadius
    
    setPosition(new THREE.Vector3(
      parentPosition.x + x,
      parentPosition.y,
      parentPosition.z + z
    ))
  })

  return (
    <>
      <group position={[position.x, position.y, position.z]}>
        <Sphere ref={ref} args={[radius, 16, 16]}>
          <meshStandardMaterial color="#CCCCCC" />
        </Sphere>
        <Label name={name} />
      </group>
      <group position={[parentPosition.x, parentPosition.y, parentPosition.z]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={64}
              array={new Float32Array(
                [...Array(64)].map((_, i) => {
                  const angle = (i / 32) * Math.PI * 2
                  return [
                    Math.sin(angle) * orbitRadius,
                    0,
                    Math.cos(angle) * orbitRadius,
                  ]
                }).flat()
              )}
              itemSize={3}
              args={[
                new Float32Array(
                  [...Array(64)].map((_, i) => {
                    const angle = (i / 32) * Math.PI * 2
                    return [
                      Math.sin(angle) * orbitRadius,
                      0,
                      Math.cos(angle) * orbitRadius,
                    ]
                  }).flat()
                ),
                3
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#444444" opacity={0.2} transparent={true} />
        </line>
      </group>
    </>
  )
}

interface PlanetProps {
  radius: number
  orbitRadius: number
  color: string
  orbitalPeriod: number
  moons?: Array<{
    name: string
    radius: number
    orbitRadius: number
    orbitalPeriod: number
  }>
  isPlaying: boolean
}

const Planet = ({ radius, orbitRadius, color, orbitalPeriod, moons = [], isPlaying, name }: PlanetProps & { name: string }) => {
  const ref = useRef<THREE.Mesh>(null)
  const time = useRef(Math.random() * 100)
  const [position, setPosition] = useState(() => {
    const initialX = Math.sin(time.current * (2 * Math.PI * ORBITAL_SPEED_FACTOR) / (orbitalPeriod * 365)) * orbitRadius
    const initialZ = Math.cos(time.current * (2 * Math.PI * ORBITAL_SPEED_FACTOR) / (orbitalPeriod * 365)) * orbitRadius
    return new THREE.Vector3(initialX, 0, initialZ)
  })

  useFrame((_state, delta) => {
    if (isPlaying) {
      time.current += delta
      const orbitalSpeed = (2 * Math.PI * ORBITAL_SPEED_FACTOR) / (orbitalPeriod * 365)
      const x = Math.sin(time.current * orbitalSpeed) * orbitRadius
      const z = Math.cos(time.current * orbitalSpeed) * orbitRadius
      setPosition(new THREE.Vector3(x, 0, z))
    }
  })

  return (
    <>
      <group position={[position.x, position.y, position.z]}>
        <Sphere ref={ref} args={[radius, 32, 32]}>
          <meshStandardMaterial color={color} />
        </Sphere>
        <Label name={name} />
      </group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={64}
            array={new Float32Array(
              [...Array(64)].map((_, i) => {
                const angle = (i / 32) * Math.PI * 2
                return [
                  Math.sin(angle) * orbitRadius,
                  0,
                  Math.cos(angle) * orbitRadius,
                ]
              }).flat()
            )}
            itemSize={3}
            args={[
              new Float32Array(
                [...Array(64)].map((_, i) => {
                  const angle = (i / 32) * Math.PI * 2
                  return [
                    Math.sin(angle) * orbitRadius,
                    0,
                    Math.cos(angle) * orbitRadius,
                  ]
                }).flat()
              ),
              3
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#666666" opacity={0.3} transparent={true} />
      </line>
      {moons.map((moon) => (
        <Moon
          key={moon.name}
          {...moon}
          parentPosition={position}
          isPlaying={isPlaying}
        />
      ))}
    </>
  )
}

const Sun = ({ isPlaying }: { isPlaying: boolean }) => {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((_state, delta) => {
    if (ref.current && isPlaying) {
      const rotationSpeed = (2 * Math.PI * ROTATION_SPEED_FACTOR) / CELESTIAL_BODIES.sun.rotationPeriod
      ref.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <group>
      <Sphere ref={ref} args={[CELESTIAL_BODIES.sun.radius, 32, 32]}>
        <meshStandardMaterial
          color={CELESTIAL_BODIES.sun.color}
          emissive={CELESTIAL_BODIES.sun.color}
          emissiveIntensity={2}
        />
      </Sphere>
      <Label name="Sun" />
    </group>
  )
}

const AsteroidBelt = ({ isPlaying }: { isPlaying: boolean }) => {
  const points = useMemo(() => {
    const vertices = []
    for (let i = 0; i < NUM_ASTEROIDS; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = ASTEROID_BELT_INNER_RADIUS + Math.random() * (ASTEROID_BELT_OUTER_RADIUS - ASTEROID_BELT_INNER_RADIUS)
      vertices.push(
        Math.cos(angle) * radius, // x
        (Math.random() - 0.5) * 2, // y (slight vertical spread)
        Math.sin(angle) * radius // z
      )
    }
    return new Float32Array(vertices)
  }, [])

  const [rotation, setRotation] = useState(0)

  useFrame((_state, delta) => {
    if (isPlaying) {
      setRotation(prev => prev + delta * 0.05)
    }
  })

  return (
    <points rotation-y={rotation}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={NUM_ASTEROIDS}
          array={points}
          itemSize={3}
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#888888"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
      />
    </points>
  )
}

const Meteor = ({ position }: { position: THREE.Vector3 }) => {
  const ref = useRef<THREE.Mesh>(null)
  const scale = useRef(0.2 + Math.random() * 0.3)

  return (
    <mesh ref={ref} position={position} scale={scale.current}>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#8B8B8B"
        roughness={0.8}
        metalness={0.5}
        flatShading={true}
      />
    </mesh>
  )
}

const Meteors = ({ isPlaying }: { isPlaying: boolean }) => {
  const [meteors] = useState(() => 
    Array(NUM_METEORS).fill(0).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * METEOR_FIELD_SIZE,
        (Math.random() - 0.5) * METEOR_FIELD_SIZE,
        (Math.random() - 0.5) * METEOR_FIELD_SIZE
      ),
    }))
  )

  useFrame((_state, delta) => {
    if (isPlaying) {
      meteors.forEach(meteor => {
        meteor.position.add(new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).multiplyScalar(delta * 5))

        // Wrap around if meteor goes too far
        if (Math.abs(meteor.position.x) > METEOR_FIELD_SIZE / 2) {
          meteor.position.x *= -0.9
        }
        if (Math.abs(meteor.position.y) > METEOR_FIELD_SIZE / 2) {
          meteor.position.y *= -0.9
        }
        if (Math.abs(meteor.position.z) > METEOR_FIELD_SIZE / 2) {
          meteor.position.z *= -0.9
        }
      })
    }
  })

  return (
    <group>
      {meteors.map((meteor, index) => (
        <Meteor
          key={index}
          position={meteor.position}
        />
      ))}
    </group>
  )
}

interface SolarSystemProps {
  isPlaying: boolean
}

const SolarSystem = ({ isPlaying }: SolarSystemProps) => {
  return (
    <group>
      <Sun isPlaying={isPlaying} />
      <Planet {...CELESTIAL_BODIES.mercury} name="Mercury" isPlaying={isPlaying} />
      <Planet {...CELESTIAL_BODIES.venus} name="Venus" isPlaying={isPlaying} />
      <Planet {...CELESTIAL_BODIES.earth} name="Earth" isPlaying={isPlaying} />
      <Planet {...CELESTIAL_BODIES.mars} name="Mars" isPlaying={isPlaying} />
      <AsteroidBelt isPlaying={isPlaying} />
      <Planet {...CELESTIAL_BODIES.jupiter} name="Jupiter" isPlaying={isPlaying} />
      <Planet {...CELESTIAL_BODIES.saturn} name="Saturn" isPlaying={isPlaying} />
      <Planet {...CELESTIAL_BODIES.uranus} name="Uranus" isPlaying={isPlaying} />
      <Planet {...CELESTIAL_BODIES.neptune} name="Neptune" isPlaying={isPlaying} />
      <Meteors isPlaying={isPlaying} />
    </group>
  )
}

export default SolarSystem 