import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// ─────────────────────────────────────────────
// ASA DE CARBONO (ala aerodinâmica)
// Construída proceduralmente com geometria customizada
// ─────────────────────────────────────────────
function CarbonWing({ position = [0, 0, 0] }) {
  const groupRef = useRef();

  // Material carbon fiber: dark + anisotropia simulada
  const carbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0d0d0d',
    roughness: 0.18,
    metalness: 0.85,
    envMapIntensity: 2.5,
  }), []);

  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111118',
    roughness: 0.08,
    metalness: 0.95,
    envMapIntensity: 3.0,
    emissive: '#2B4CFF',
    emissiveIntensity: 0.12,
  }), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.22) * 0.08;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.45) * 0.06;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Plano principal da asa — geometria trapezoidal aproximada */}
      <mesh material={carbonMat} castShadow>
        <boxGeometry args={[2.2, 0.06, 0.55]} />
      </mesh>

      {/* Espessura do bordo de fuga (trailing edge) */}
      <mesh position={[0, 0, -0.23]} material={edgeMat} castShadow>
        <boxGeometry args={[2.2, 0.03, 0.04]} />
      </mesh>

      {/* Suportes (pylons) */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={i} position={[x, -0.22, 0.05]} material={carbonMat} castShadow>
          <boxGeometry args={[0.055, 0.4, 0.38]} />
        </mesh>
      ))}

      {/* Placa de montagem base */}
      <mesh position={[0, -0.42, 0.05]} material={edgeMat} castShadow>
        <boxGeometry args={[1.6, 0.04, 0.42]} />
      </mesh>

      {/* Canards laterais pequenos */}
      {[-1.1, 1.1].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, i === 0 ? 0.1 : -0.1]} material={carbonMat}>
          <boxGeometry args={[0.18, 0.04, 0.28]} />
        </mesh>
      ))}

      {/* Edge glow emissivo nas bordas */}
      <mesh position={[0, 0.035, -0.25]} material={
        new THREE.MeshBasicMaterial({ color: '#2B4CFF', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
      }>
        <boxGeometry args={[2.18, 0.004, 0.003]} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────
// DISCO DE FREIO CERÂMICO
// ─────────────────────────────────────────────
function BrakeDisc({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  const discRef  = useRef();

  // Material do disco cerâmico: cinza escuro, metalness alto
  const discMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1e',
    roughness: 0.22,
    metalness: 0.90,
    envMapIntensity: 2.8,
  }), []);

  // Material das ranhuras (mais escuro)
  const slotMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0a0c',
    roughness: 0.4,
    metalness: 0.6,
    emissive: '#2B4CFF',
    emissiveIntensity: 0.08,
  }), []);

  // Material do centro (cubo) – anel metálico
  const hubMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#222228',
    roughness: 0.1,
    metalness: 1.0,
    envMapIntensity: 3.5,
  }), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.14;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.38 + 1.2) * 0.05;
    // O disco roda mais rápido no próprio eixo
    if (discRef.current) discRef.current.rotation.z = t * 0.7;
  });

  // Ranhuras radiais (slots) — 12 retângulos distribuídos em arco
  const slots = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      return { angle, x: Math.cos(angle) * 0.55, y: Math.sin(angle) * 0.55 };
    });
  }, []);

  return (
    <group ref={groupRef} position={position}>
      <group ref={discRef}>
        {/* Disco principal */}
        <mesh material={discMat} castShadow>
          <cylinderGeometry args={[0.82, 0.82, 0.055, 64]} />
        </mesh>

        {/* Anel interno ventilado */}
        <mesh material={hubMat} position={[0, 0, 0]}>
          <torusGeometry args={[0.58, 0.07, 12, 48]} />
        </mesh>

        {/* Ranhuras radiais */}
        {slots.map((s, i) => (
          <mesh
            key={i}
            material={slotMat}
            position={[s.x, 0, s.y]}
            rotation={[Math.PI / 2, s.angle, 0]}
          >
            <boxGeometry args={[0.035, 0.27, 0.06]} />
          </mesh>
        ))}

        {/* Hub central */}
        <mesh material={hubMat}>
          <cylinderGeometry args={[0.18, 0.18, 0.065, 32]} />
        </mesh>

        {/* Parafusos do hub */}
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} material={hubMat} position={[Math.cos(a) * 0.28, 0.03, Math.sin(a) * 0.28]}>
              <cylinderGeometry args={[0.025, 0.025, 0.04, 8]} />
            </mesh>
          );
        })}

        {/* Edge glow no rim externo */}
        <mesh>
          <torusGeometry args={[0.82, 0.006, 8, 64]} />
          <meshBasicMaterial color="#2B4CFF" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────
// LUZES DA CENA
// ─────────────────────────────────────────────
function SceneLights() {
  const keyRef   = useRef();
  const fillRef  = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (keyRef.current)  keyRef.current.intensity  = 3.0 + Math.sin(t * 1.6) * 0.35;
    if (fillRef.current) fillRef.current.intensity = 1.2 + Math.sin(t * 0.9 + 1) * 0.2;
  });

  return (
    <>
      <ambientLight intensity={0.06} />
      {/* Key light azul superior */}
      <pointLight ref={keyRef}  position={[0, 4, 2]}   color="#2B4CFF" intensity={3.0} distance={12} />
      {/* Rim esquerdo */}
      <pointLight               position={[-4, 1, 0]}  color="#1a30ff" intensity={1.8} distance={10} />
      {/* Rim direito */}
      <pointLight ref={fillRef} position={[4, -1, 0]}  color="#0a20ff" intensity={1.2} distance={10} />
      {/* Contra-luz de baixo */}
      <pointLight               position={[0, -4, 1]}  color="#2B4CFF" intensity={0.5} distance={8}  />
    </>
  );
}

// ─────────────────────────────────────────────
// CÂMERA ORBITAL LENTA
// ─────────────────────────────────────────────
function OrbitalCamera() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x =  Math.sin(t * 0.09) * 1.2;
    camera.position.y =  0.6 + Math.sin(t * 0.05) * 0.3;
    camera.position.z =  4.8 + Math.cos(t * 0.07) * 0.4;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─────────────────────────────────────────────
// EXPORT: cena com duas peças lado a lado
// ─────────────────────────────────────────────
export default function PartsScene({ focus = 'both' }) {
  return (
    <div className="parts-canvas-wrapper">
      <Canvas
        shadows={false}
        dpr={[1, 2]}
        camera={{ position: [0, 0.6, 4.8], fov: 40 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.88,
        }}
        style={{ background: '#121212' }}
      >
        <fog attach="fog" args={['#0a0a10', 8, 18]} />

        <OrbitalCamera />
        <SceneLights />

        <Suspense fallback={null}>
          <Environment preset="night" />

          {focus === 'wing'  && <CarbonWing  position={[0, 0, 0]} />}
          {focus === 'disc'  && <BrakeDisc   position={[0, 0, 0]} />}
          {focus === 'both'  && (
            <>
              <CarbonWing position={[-1.4, 0.2, 0]} />
              <BrakeDisc  position={[ 1.4, -0.1, 0]} />
            </>
          )}

          <Sparkles
            count={50}
            scale={[6, 4, 3]}
            size={0.8}
            speed={0.4}
            color="#2B4CFF"
            opacity={0.5}
          />
        </Suspense>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.18}
            luminanceSmoothing={0.88}
            intensity={2.6}
            mipmapBlur
          />
          <ChromaticAberration offset={[0.001, 0.001]} />
          <Vignette eskil={false} offset={0.08} darkness={0.88} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
