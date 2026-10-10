
import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Torus, Html, Cylinder, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

// Fix: Use PascalCase variables for intrinsic Three.js elements to bypass JSX.IntrinsicElements type checking errors
const MeshStandardMaterial_ = 'meshStandardMaterial' as any;
const Group_ = 'group' as any;

interface SkeletonProps {
  onSelect?: (name: string) => void;
  activePart?: string | null;
  loading?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ onSelect, activePart, loading }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const skeletonGroupRef = useRef<THREE.Group>(null);

  const boneTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fffcf5';
      ctx.fillRect(0, 0, 1024, 1024);
      // Create microscopic porous detail
      for (let i = 0; i < 90000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const size = Math.random() * 2;
        ctx.fillStyle = `rgba(90, 70, 50, ${Math.random() * 0.15})`;
        ctx.fillRect(x, y, size, size);
      }
      // Add subtle organic bone grain
      ctx.strokeStyle = 'rgba(0,0,0,0.03)';
      for (let i = 0; i < 200; i++) {
        ctx.beginPath();
        const startX = Math.random() * 1024;
        const startY = Math.random() * 1024;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (Math.random() - 0.5) * 40, startY + (Math.random() - 0.5) * 40);
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    return texture;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (skeletonGroupRef.current) {
      skeletonGroupRef.current.position.y = Math.sin(t * 1.2) * 0.03;
      skeletonGroupRef.current.rotation.y = Math.sin(t * 0.2) * 0.04;
    }
  });

  const getBoneMat = (name: string) => {
    const isActive = activePart === name;
    const isHovered = hovered === name;
    return (
      <MeshStandardMaterial_ 
        map={boneTexture}
        bumpMap={boneTexture}
        bumpScale={0.12} // Emphasize the porous texture
        color={isActive ? "#cbd5e1" : isHovered ? "#ffffff" : "#fffdf7"} 
        roughness={0.92} // Matte finish typical of bone
        metalness={0.0}
        // Subsurface scattering fake: warm light from within mimics light depth in organic material
        emissive={isActive ? "#6366f1" : isHovered ? "#fff7ed" : "#f5eadc"}
        emissiveIntensity={isActive ? 1.0 : 0.3}
      />
    );
  };

  const BoneSegment = ({ name, children, position, rotation, scale }: any) => (
    <Group_ 
      position={position} rotation={rotation} scale={scale}
      onPointerOver={(e: any) => { e.stopPropagation(); setHovered(name); }}
      onPointerOut={() => setHovered(null)}
      onClick={(e: any) => { e.stopPropagation(); onSelect?.(name); }}
    >
      {children}
    </Group_>
  );

  const Vertebra = ({ name, position, scale = [1, 1, 1] }: any) => (
    <BoneSegment name={name} position={position} scale={scale}>
      <Box args={[0.6, 0.4, 0.5]}>{getBoneMat(name)}</Box>
      <Box args={[0.1, 0.2, 0.8]} position={[0, 0, -0.4]}>{getBoneMat(name)}</Box>
    </BoneSegment>
  );

  return (
    <Group_ scale={0.75} position={[0, 0.5, 0]}>
      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.1}>
        <Group_ ref={skeletonGroupRef}>
          
          {/* Detailed Spine */}
          <Group_ position={[0, 0, -0.2]}>
            {[...Array(24)].map((_, i) => {
              let name = "Thoracic Vertebrae";
              if (i < 7) name = "Cervical Vertebrae";
              else if (i > 18) name = "Lumbar Vertebrae";
              return (
                <Vertebra 
                  key={i} 
                  name={name} 
                  position={[0, 2 - (i * 0.12), 0]} 
                  scale={[0.5 + (i * 0.02), 0.3, 0.5 + (i * 0.02)]} 
                />
              );
            })}
          </Group_>

          {/* Cranium */}
          <BoneSegment name="Cranium" position={[0, 2.4, 0]}>
            <Sphere args={[0.7, 32, 32]} scale={[1, 1.15, 1.15]}>{getBoneMat('Cranium')}</Sphere>
          </BoneSegment>

          {/* Detailed Femur, Tibia, Fibula */}
          {[-0.55, 0.55].map((xSide, sideIdx) => {
            const side = sideIdx === 0 ? "Left" : "Right";
            return (
              <Group_ key={side} position={[xSide, -1.8, 0]}>
                {/* Femur */}
                <BoneSegment name={`${side} Femur`} position={[0, -0.9, 0]} rotation={[0, 0, xSide * 0.1]}>
                  <Cylinder args={[0.13, 0.13, 1.8, 16]}>{getBoneMat(`${side} Femur`)}</Cylinder>
                  <Sphere args={[0.18, 16, 16]} position={[xSide * 0.3, 0.9, 0]}>{getBoneMat(`${side} Femur`)}</Sphere>
                  <Group_ position={[0, -0.9, 0]}>
                    <Sphere args={[0.16, 16, 16]} position={[-0.1, 0, 0]}>{getBoneMat(`${side} Femur`)}</Sphere>
                    <Sphere args={[0.16, 16, 16]} position={[0.1, 0, 0]}>{getBoneMat(`${side} Femur`)}</Sphere>
                  </Group_>
                </BoneSegment>
                {/* Tibia & Fibula */}
                <Group_ position={[0, -2.8, 0]}>
                  <BoneSegment name={`${side} Tibia`}>
                    <Cylinder args={[0.16, 0.1, 1.8, 16]}>{getBoneMat(`${side} Tibia`)}</Cylinder>
                  </BoneSegment>
                  <BoneSegment name={`${side} Fibula`} position={[xSide * 0.3, 0, 0]}>
                    <Cylinder args={[0.05, 0.05, 1.8, 16]}>{getBoneMat(`${side} Fibula`)}</Cylinder>
                  </BoneSegment>
                </Group_>
              </Group_>
            );
          })}

          {/* Pelvis */}
          <BoneSegment name="Pelvis" position={[0, -1.6, -0.1]}>
             <Torus args={[0.85, 0.28, 16, 32]} rotation={[Math.PI / 2.1, 0, 0]}>
                {getBoneMat('Pelvis')}
             </Torus>
          </BoneSegment>

          {(hovered || activePart) && (
            <Html position={[1.4, 2.5, 0]} center>
              <div className="bg-slate-900/95 text-white px-8 py-4 rounded-[2.5rem] border-2 border-white/20 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200">
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Bone Registry</span>
                    <span className="text-xl font-black uppercase tracking-tight">{hovered || activePart}</span>
                    {loading && activePart === (hovered || activePart) && (
                      <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-300">Analyzing Matrix...</span>
                      </div>
                    )}
                 </div>
              </div>
            </Html>
          )}
        </Group_>
      </Float>
    </Group_>
  );
};

export default Skeleton;
