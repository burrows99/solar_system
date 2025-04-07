import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import SolarSystem from './components/SolarSystem'
import SpaceEffects from './components/SpaceEffects'
import OuterSolarSystem from './components/OuterSolarSystem'
import DeepSpaceObjects from './components/DeepSpaceObjects'
import SolarFlares from './components/SolarFlares'
import './App.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [showLabels, setShowLabels] = useState(true)

  return (
    <div className="canvas-container">
      <div className="control-panel">
        <button
          className="control-button"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          className="control-button"
          onClick={() => setShowLabels(!showLabels)}
        >
          {showLabels ? 'Hide Labels' : 'Show Labels'}
        </button>
      </div>
      <Canvas camera={{ position: [0, 20, 50], fov: 60 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} intensity={1000} color="#ffffff" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <DeepSpaceObjects />
        <SolarSystem isPlaying={isPlaying} showLabels={showLabels} />
        <SolarFlares isPlaying={isPlaying} />
        <SpaceEffects isPlaying={isPlaying} showLabels={showLabels} />
        <OuterSolarSystem isPlaying={isPlaying} />
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
