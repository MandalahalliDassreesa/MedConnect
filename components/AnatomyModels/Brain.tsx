
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Float, Html, Points, PointMaterial } from '@react-three/drei';
// Fix: Removed broken 'this' import which was unused and used THREE_LIB instead
import * as THREE_LIB from 'three';
import { Loader2 } from 'lucide-react';

// Fix: Use PascalCase variables for intrinsic Three.js elements to bypass JSX.IntrinsicElements type checking errors
const MeshStandardMaterial_ = 'meshStandardMaterial' as any;
const Group_ = 'group' as any;
const SphereGeometry_ = 'sphereGeometry' as any;

interface BrainProps {
  onSelect?: (name: string) => void;
  activePart?: string | null;
  loading?: boolean;
}

const Brain: React.FC<BrainProps> = ({ onSelect, activePart, loading }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const synapticRef = useRef<THREE_LIB.Points>(null);

  const brainTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; 
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Base tissue color - soft organic pinkish-grey
      const grad = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1500);
      grad.addColorStop(0, '#fdf2f2');
      grad.addColorStop(0.5, '#fce7f3');
      grad.addColorStop(1, '#fbcfe8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2048, 2048);
      
      // Simulate gyri and sulci (folds)
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 800; i++) {
        ctx.beginPath();
        let x = Math.random() * 2048;
        let y = Math.random() * 2048;
        ctx.moveTo(x, y);
        
        // Deep fold shadows
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(131, 24, 67, 0.3)'; 
        ctx.strokeStyle = '#f9a8d4';
        ctx.lineWidth = 15 + Math.random() * 35;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        let segments = 8 + Math.random() * 12;
        for (let j = 0; j < segments; j++) {
          const angle = Math.random() * Math.PI * 2;
          const length = 40 + Math.random() * 80;
          x += Math.cos(angle) * length;
          y += Math.sin(angle) * length;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      // Fine surface vasculature (capillaries)
      ctx.globalAlpha = 0.15;
      ctx.shadowBlur = 0;
      for (let i = 0; i < 200; i++) {
        ctx.beginPath();
        ctx.strokeStyle = Math.random() > 0.5 ? '#be123c' : '#1d4ed8'; // Red and blue vessels
        ctx.lineWidth = 1 + Math.random() * 2;
        let vx = Math.random() * 2048;
        let vy = Math.random() * 2048;
        ctx.moveTo(vx, vy);
        for (let j = 0; j < 6; j++) {
           vx += (Math.random() - 0.5) * 120;
           vy += (Math.random() - 0.5) * 120;
           ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }

      // Microscopic texture grain
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 50000; i++) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(Math.random() * 2048, Math.random() * 2048, 2, 2);
      }
    }
    
    const texture = new THREE_LIB.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE_LIB.RepeatWrapping;
    texture.repeat.set(1.2, 1.2);
    return texture;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (synapticRef.current) {
      synapticRef.current.rotation.y = time * 0.05;
      const intensity = activePart ? 1.3 : 1;
      synapticRef.current.scale.setScalar(intensity + Math.sin(time * 2) * 0.03);
    }
  });

  const Lobe = ({ name, position, scale, color }: { name: string, position: [number, number, number], scale: [number, number, number], color: string }) => {
    const isActive = activePart === name;
    const isHovered = hovered === name;
    
    return (
      <Sphere 
        args={[0.8, 128, 128]} 
        position={position} 
        scale={scale}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(name); }}
        onPointerOut={() => setHovered(null)}
        onClick={(e: any) => { e.stopPropagation(); onSelect?.(name); }}
      >
        <MeshStandardMaterial_ 
          map={brainTexture}
          bumpMap={brainTexture}
          bumpScale={0.15} 
          color={isActive ? "#4f46e5" : isHovered ? "#a5b4fc" : color} 
          roughness={0.5} 
          metalness={0.02}
          emissive={isActive ? "#4338ca" : isHovered ? "#fff1f2" : "#110000"}
          emissiveIntensity={isActive ? 1.0 : 0.05}
        />
      </Sphere>
    );
  };

  return (
    <Group_>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
        {/* External Lobes */}
        <Lobe name="Frontal Lobe" position={[0, 0.4, 0.6]} scale={[1.25, 0.9, 0.95]} color="#fef2f2" />
        <Lobe name="Parietal Lobe" position={[0, 0.7, -0.2]} scale={[1.15, 0.75, 0.95]} color="#fff1f2" />
        <Group_ position={[0, 0.1, 0.1]}>
          <Lobe name="Temporal Lobe" position={[0.75, 0, 0]} scale={[0.7, 1.15, 1.25]} color="#fff5f5" />
          <Lobe name="Temporal Lobe" position={[-0.75, 0, 0]} scale={[0.7, 1.15, 1.25]} color="#fff5f5" />
        </Group_>
        <Lobe name="Occipital Lobe" position={[0, 0.25, -0.85]} scale={[1.05, 0.85, 1.05]} color="#fefce8" />

        {/* Deep Structures */}
        <Group_ scale={0.4} position={[0, 0, 0]}>
           <Sphere 
            onPointerOver={(e) => { e.stopPropagation(); setHovered('Limbic System'); }}
            onPointerOut={() => setHovered(null)}
            onClick={(e: any) => { e.stopPropagation(); onSelect?.('Limbic System'); }}
           >
              {/* Fix: Resolved undefined 'isActive' error by checking activePart directly for Limbic System */}
              <MeshStandardMaterial_ color={activePart === 'Limbic System' ? "#ef4444" : "#ec4899"} emissive="#ec4899" emissiveIntensity={activePart === 'Limbic System' ? 2 : 0.5} />
           </Sphere>
        </Group_>

        {/* Cerebellum and Brainstem */}
        <Group_ position={[0, -0.65, -0.6]}>
          <Sphere 
            args={[0.5, 64, 64]} scale={[1.4, 0.7, 1.2]}
            onPointerOver={(e) => { e.stopPropagation(); setHovered('Cerebellum'); }}
            onPointerOut={() => setHovered(null)}
            onClick={(e: any) => { e.stopPropagation(); onSelect?.('Cerebellum'); }}
          >
            <MeshStandardMaterial_ 
              map={brainTexture} 
              bumpMap={brainTexture}
              bumpScale={0.1}
              color={activePart === 'Cerebellum' ? "#334155" : "#e2e8f0"} 
              roughness={0.7} 
              emissive={activePart === 'Cerebellum' ? "#1e293b" : "#000000"}
            />
          </Sphere>
        </Group_>

        <Group_ position={[0, -1.3, -0.2]} rotation={[-0.2, 0, 0]}>
           <Sphere args={[0.2, 32, 32]} scale={[1, 4, 1]}
            onPointerOver={(e) => { e.stopPropagation(); setHovered('Brainstem'); }}
            onPointerOut={() => setHovered(null)}
            onClick={(e: any) => { e.stopPropagation(); onSelect?.('Brainstem'); }}
           >
              <MeshStandardMaterial_ color={activePart === 'Brainstem' ? "#6366f1" : "#f1f5f9"} roughness={0.9} />
           </Sphere>
        </Group_>

        <Points ref={synapticRef}>
          <SphereGeometry_ args={[1.8, 64, 64]} />
          <PointMaterial transparent color="#818cf8" size={0.025} sizeAttenuation={true} depthWrite={false} blending={THREE_LIB.AdditiveBlending} opacity={activePart ? 0.8 : 0.15} />
        </Points>

        {(hovered || activePart) && (
          <Html position={[0, 3, 0]} center>
            <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
              <div className="bg-indigo-950/95 text-white px-10 py-5 rounded-[3rem] border-2 border-indigo-400/50 shadow-2xl backdrop-blur-3xl whitespace-nowrap">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300/60 mb-1">Structural Target</span>
                  <div className="flex items-center gap-4">
                    <div className={`w-3.5 h-3.5 rounded-full ${activePart ? 'bg-indigo-400 shadow-[0_0_10px_#818cf8]' : 'bg-rose-500 animate-pulse'}`} />
                    <span className="text-2xl font-black uppercase tracking-tighter leading-none">
                      {hovered || activePart}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Html>
        )}
      </Float>
    </Group_>
  );
};

export default Brain;
