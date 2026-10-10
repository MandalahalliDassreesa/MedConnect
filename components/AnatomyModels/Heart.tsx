
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Float, Html, Cylinder, Torus } from '@react-three/drei';
import * as THREE from 'three';

// Fix: Use PascalCase variables for intrinsic Three.js elements to bypass JSX.IntrinsicElements type checking errors
const MeshStandardMaterial_ = 'meshStandardMaterial' as any;
const Group_ = 'group' as any;
const PointLight_ = 'pointLight' as any;
const AmbientLight_ = 'ambientLight' as any;

interface HeartProps {
  onSelect?: (name: string) => void;
  activePart?: string | null;
}

const Heart: React.FC<HeartProps> = ({ onSelect, activePart }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Procedural myocardial texture
  const heartTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(0, 0, 512, 512);
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 500; i++) {
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 20, y + Math.random() * 20);
        ctx.stroke();
      }
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      // Natural cardiac rhythm: double beat (S1, S2)
      const s1 = Math.pow(Math.sin(time * 3.5), 12) * 0.12;
      const s2 = Math.pow(Math.sin(time * 3.5 + 0.6), 14) * 0.06;
      const pulse = 1 + s1 + s2;
      meshRef.current.scale.set(pulse, pulse * 1.05, pulse * 0.95);
      meshRef.current.rotation.y = Math.sin(time * 0.15) * 0.08;
    }
  });

  const getMat = (name: string, baseColor: string) => {
    const isActive = activePart === name;
    const isHovered = hovered === name;
    return (
      <MeshStandardMaterial_ 
        map={heartTexture}
        color={isActive ? "#ef4444" : isHovered ? "#f87171" : baseColor}
        roughness={0.15}
        metalness={0.1}
        emissive={isActive ? "#450a0a" : isHovered ? "#220000" : "#110000"}
        emissiveIntensity={isActive ? 1.5 : 0.4}
      />
    );
  };

  const HeartPart = ({ name, children, ...props }: any) => (
    <Group_ 
      {...props}
      onPointerOver={(e: any) => { e.stopPropagation(); setHovered(name); }}
      onPointerOut={() => setHovered(null)}
      onClick={(e: any) => { e.stopPropagation(); onSelect?.(name); }}
    >
      {children}
    </Group_>
  );

  return (
    <Group_ ref={meshRef} scale={1.2}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        
        {/* Left Ventricle - Main pumping chamber */}
        <HeartPart name="Left Ventricle" position={[0.15, -0.4, 0]} scale={[1.1, 1.5, 1]}>
          <Sphere args={[0.75, 64, 64]}>{getMat('Left Ventricle', "#881337")}</Sphere>
        </HeartPart>

        {/* Right Ventricle */}
        <HeartPart name="Right Ventricle" position={[-0.45, -0.3, 0.1]} scale={[1, 1.3, 0.9]}>
          <Sphere args={[0.65, 64, 64]}>{getMat('Right Ventricle', "#9f1239")}</Sphere>
        </HeartPart>

        {/* Atria and Auricles (Appendages) */}
        <HeartPart name="Right Atrium" position={[-0.6, 0.5, 0.2]}>
          <Sphere args={[0.45, 32, 32]}>{getMat('Right Atrium', "#be123c")}</Sphere>
          {/* Right Auricle */}
          <Sphere args={[0.2, 16, 16]} position={[0.2, 0.1, 0.2]} scale={[1.5, 1, 1]}>
            {getMat('Right Atrium', "#be123c")}
          </Sphere>
        </HeartPart>

        <HeartPart name="Left Atrium" position={[0.4, 0.6, -0.2]}>
          <Sphere args={[0.4, 32, 32]}>{getMat('Left Atrium', "#be123c")}</Sphere>
          {/* Left Auricle */}
          <Sphere args={[0.18, 16, 16]} position={[-0.2, 0, 0.2]} scale={[1.4, 1, 1]}>
            {getMat('Left Atrium', "#be123c")}
          </Sphere>
        </HeartPart>

        {/* Great Vessels */}
        <HeartPart name="Aorta" position={[0.3, 1, -0.2]} rotation={[0, 0, -0.5]}>
          <Torus args={[0.55, 0.15, 16, 64, Math.PI * 0.85]}>
            <MeshStandardMaterial_ color={activePart === 'Aorta' ? "#ef4444" : "#4c0519"} roughness={0.1} metalness={0.8} />
          </Torus>
        </HeartPart>

        <HeartPart name="Pulmonary Trunk" position={[-0.2, 0.9, 0.35]} rotation={[0, 0, 0.5]}>
          <Cylinder args={[0.16, 0.18, 1.2, 32]}>
            <MeshStandardMaterial_ color={activePart === 'Pulmonary Trunk' ? "#3b82f6" : "#1e3a8a"} roughness={0.3} metalness={0.5} />
          </Cylinder>
        </HeartPart>

        <HeartPart name="Vena Cava" position={[-0.75, 1, 0.1]}>
          <Cylinder args={[0.14, 0.14, 1, 32]}>
             <MeshStandardMaterial_ color="#1d4ed8" roughness={0.5} />
          </Cylinder>
        </HeartPart>

        {(hovered || activePart) && (
          <Html position={[0, 2.5, 0]} center>
            <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
              <div className="bg-rose-950/95 text-white px-8 py-4 rounded-[2.5rem] border-2 border-rose-400/40 shadow-2xl backdrop-blur-2xl whitespace-nowrap">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-300/60 mb-1">Cardiac Identity</span>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-rose-400 animate-pulse`} />
                    <span className="text-xl font-black uppercase tracking-tight leading-none">
                      {hovered || activePart}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-1 h-10 bg-gradient-to-b from-rose-500/50 to-transparent" />
            </div>
          </Html>
        )}
      </Float>
      
      <PointLight_ position={[0, 0, 0]} intensity={activePart ? 25 : 5} color="#ef4444" />
      <AmbientLight_ intensity={0.5} />
    </Group_>
  );
};

export default Heart;
