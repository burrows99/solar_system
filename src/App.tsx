import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import SolarSystem from './components/SolarSystem'
import './App.css'

function App() {
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backgroundColor: 'rgba(51, 51, 51, 0.8)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          zIndex: 1000,
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(5px)',
        }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <Canvas camera={{ position: [0, 20, 50], fov: 60 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} intensity={1000} color="#ffffff" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <SolarSystem isPlaying={isPlaying} />
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
        />
      </Canvas>
    </div>
  )
}

export default App
