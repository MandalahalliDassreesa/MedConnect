
import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment } from '@react-three/drei';
import { RefreshCw, Maximize2 } from 'lucide-react';
import Heart from './AnatomyModels/Heart';
import Brain from './AnatomyModels/Brain';
import Skeleton from './AnatomyModels/Skeleton';
import NervousSystem from './AnatomyModels/NervousSystem';

interface ThreeSceneProps {
  model: 'heart' | 'brain' | 'skeleton' | 'nervous';
  onSelectPart: (name: string) => void;
  selectedPart: string | null;
  loading?: boolean;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ model, onSelectPart, selectedPart, loading }) => {
  const controlsRef = useRef<any>(null);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner cursor-crosshair group/scene">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} shadows="contact">
            {model === 'heart' && <Heart onSelect={onSelectPart} activePart={selectedPart} />}
            {model === 'brain' && <Brain onSelect={onSelectPart} activePart={selectedPart} loading={loading} />}
            {model === 'skeleton' && <Skeleton onSelect={onSelectPart} activePart={selectedPart} loading={loading} />}
            {model === 'nervous' && <NervousSystem onSelect={onSelectPart} activePart={selectedPart} />}
          </Stage>
          <Environment preset="night" />
        </Suspense>
        <OrbitControls 
          ref={controlsRef}
          makeDefault 
          autoRotate={!selectedPart} 
          autoRotateSpeed={0.5} 
          minDistance={3}
          maxDistance={12}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Viewport Overlays */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          onClick={handleReset}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white/70 hover:text-white transition-all border border-white/10 active:scale-90 shadow-2xl group"
          title="Reset Camera"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        </button>
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white/70 border border-white/10 hidden group-hover/scene:block animate-in fade-in slide-in-from-right-2">
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex items-center gap-3">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white/70 uppercase tracking-widest border border-white/10 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${!selectedPart ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
          3D {model} Explorer
        </div>
      </div>
    </div>
  );
};

export default ThreeScene;
