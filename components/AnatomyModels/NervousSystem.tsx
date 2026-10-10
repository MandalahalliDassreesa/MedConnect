
import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

// Fix: Use PascalCase variables for intrinsic Three.js elements to bypass JSX.IntrinsicElements type checking errors
const MeshStandardMaterial_ = 'meshStandardMaterial' as any;
const Group_ = 'group' as any;
const Mesh_ = 'mesh' as any;
const CylinderGeometry_ = 'cylinderGeometry' as any;
const SphereGeometry_ = 'sphereGeometry' as any;
const MeshBasicMaterial_ = 'meshBasicMaterial' as any;

interface NervousSystemProps {
  onSelect?: (name: string) => void;
  activePart?: string | null;
}

const NervousSystem: React.FC<NervousSystemProps> = ({ onSelect, activePart }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const count = 6000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const t = Math.random();
        const y = (t - 0.5) * 6; 
        const isCore = Math.random() > 0.4;
        
        if (isCore) {
            pos[i * 3] = (Math.random() - 0.5) * 0.15;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
        } else {
            const angle = Math.random() * Math.PI * 2;
            const branchFactor = Math.pow(Math.sin(t * Math.PI), 2.5) * 3;
            const dist = Math.random() * branchFactor;
            pos[i * 3] = dist * Math.cos(angle);
            pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.3;
            pos[i * 3 + 2] = dist * Math.sin(angle);
        }
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.08;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.size = 0.04 + Math.sin(time * 5) * 0.01;
    }
  });

  return (
    <Group_>
      {/* Spinal Axis Signal */}
      <Mesh_ position={[0, 0, 0]}>
        <CylinderGeometry_ args={[0.06, 0.06, 6, 32]} />
        <MeshStandardMaterial_ 
          color="#0ea5e9" 
          emissive="#0ea5e9" 
          emissiveIntensity={activePart ? 8 : 3} 
          transparent 
          opacity={0.4} 
        />
      </Mesh_>

      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          color={activePart ? "#7dd3fc" : "#38bdf8"}
          size={0.04}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
      </Points>

      {/* Signal Pulses */}
      {[...Array(12)].map((_, i) => (
        <NeuralPulse key={i} delay={i * 1.2} />
      ))}

      {/* Pathway Zones */}
      <Group_>
        <Zone name="Cerebral Cortex" position={[0, 2.5, 0]} scale={1} onHover={setHovered} onSelect={onSelect} active={activePart === 'Cerebral Cortex'} />
        <Zone name="Cervical Plexus" position={[0, 1.5, 0]} scale={0.4} onHover={setHovered} onSelect={onSelect} active={activePart === 'Cervical Plexus'} />
        <Zone name="Brachial Plexus" position={[1.2, 1.3, 0]} scale={0.5} onHover={setHovered} onSelect={onSelect} active={activePart === 'Brachial Plexus'} />
        <Zone name="Lumbar Plexus" position={[0, -1.8, 0]} scale={0.6} onHover={setHovered} onSelect={onSelect} active={activePart === 'Lumbar Plexus'} />
        <Zone name="Sciatic Nerve" position={[0.8, -2.5, 0]} scale={0.6} onHover={setHovered} onSelect={onSelect} active={activePart === 'Sciatic Nerve'} />
      </Group_>

      {(hovered || activePart) && (
        <Html position={[0, 3.2, 0]} center>
          <div className="bg-sky-950/95 text-white px-8 py-4 rounded-[2rem] border-2 border-sky-400/40 shadow-2xl backdrop-blur-2xl">
            <span className="text-xl font-black uppercase tracking-tight">{hovered || activePart}</span>
          </div>
        </Html>
      )}
    </Group_>
  );
};

const Zone = ({ name, position, scale, onSelect, onHover, active }: any) => (
  <Mesh_ 
    position={position} scale={scale}
    onPointerOver={(e: any) => { e.stopPropagation(); onHover(name); }}
    onPointerOut={() => onHover(null)}
    onClick={(e: any) => { e.stopPropagation(); onSelect?.(name); }}
  >
    <SphereGeometry_ args={[1, 16, 16]} />
    <MeshBasicMaterial_ color={active ? "#7dd3fc" : "#ffffff"} transparent opacity={active ? 0.3 : 0} />
  </Mesh_>
);

// Fix: NeuralPulse defined with React.FC to properly handle standard props like 'key' in mapped components
const NeuralPulse: React.FC<{ delay: number }> = ({ delay }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const time = (state.clock.elapsedTime + delay) % 4;
    const progress = time / 4;
    if (ref.current) {
        ref.current.position.y = 2.8 - (progress * 5.6);
        ref.current.scale.setScalar(0.08 + Math.sin(progress * Math.PI) * 0.15);
        const mat = ref.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(progress * Math.PI) * 0.9;
    }
  });
  return (
    <Mesh_ ref={ref}>
      <SphereGeometry_ args={[1, 16, 16]} />
      <MeshBasicMaterial_ color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} />
    </Mesh_>
  );
};

export default NervousSystem;
