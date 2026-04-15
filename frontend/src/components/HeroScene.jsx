import { useRef, Suspense, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────
// Recebe scrollProgress (0→1) via prop e controla TUDO na cena
// ─────────────────────────────────────────────────────────────────

// ── Plano do carro ──────────────────────────────────────────────
function CarPlane({ progressRef }) {
  const texture = useTexture('/carros/audi rs6 fosco.jpg');
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const meshRef = useRef();
  const matRef  = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    const p  = progressRef.current;          // 0 → 1
    const t  = clock.getElapsedTime();

    // Fase 0: carro quase invisível — só reflexos (brilho muito baixo)
    // Fase 1: totalmente revelado com metalness alto
    const brightness  = THREE.MathUtils.lerp(0.04, 1.0, Math.min(p * 2.5, 1));
    const metalness   = THREE.MathUtils.lerp(0.1,  0.85, Math.min(p * 2, 1));
    const envInt      = THREE.MathUtils.lerp(0.2,  2.8,  Math.min(p * 2, 1));

    matRef.current.envMapIntensity = envInt;
    matRef.current.metalness       = metalness;

    // Zoom da câmera: p 0.4→0.8 faz a câmera se aproximar
    const zoomP = THREE.MathUtils.clamp((p - 0.35) / 0.45, 0, 1);
    const scaleX = THREE.MathUtils.lerp(1.0, 1.12, zoomP);
    const scaleY = THREE.MathUtils.lerp(1.0, 1.12, zoomP);
    meshRef.current.scale.set(scaleX, scaleY, 1);

    // Tilt cinematográfico leve + float
    meshRef.current.rotation.y = Math.sin(t * 0.12) * 0.06 * (0.3 + p * 0.7);
    meshRef.current.position.y = -0.1 + Math.sin(t * 0.35) * 0.02 * p;

    // Brilho geral via tone mapping — escurece no início
    matRef.current.color.setScalar(brightness);
  });

  return (
    <mesh ref={meshRef} position={[0, -0.1, 0]}>
      <planeGeometry args={[5.5, 3.1]} />
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        roughness={0.12}
        metalness={0.1}
        envMapIntensity={0.2}
        color={new THREE.Color(0.04, 0.04, 0.04)}
      />
    </mesh>
  );
}

// ── Piso reflexivo ───────────────────────────────────────────────
function StudioFloor({ progressRef }) {
  const matRef = useRef();
  useFrame(() => {
    if (!matRef.current) return;
    const p = progressRef.current;
    matRef.current.envMapIntensity = THREE.MathUtils.lerp(0, 0.9, Math.min(p * 3, 1));
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial ref={matRef} color="#0a0a0a" roughness={0.04} metalness={0.95} envMapIntensity={0} />
    </mesh>
  );
}

// ── Neons azuis no teto ──────────────────────────────────────────
function NeonLights({ progressRef }) {
  const refs = [useRef(), useRef(), useRef()];
  const positions = [[-2.5, 2.2, -1], [2.5, 2.2, -1], [0, 2.4, -2]];

  useFrame(({ clock }) => {
    const p = progressRef.current;
    // Neons só aparecem a partir de p=0.15, atingem max em p=0.5
    const neonP = THREE.MathUtils.clamp((p - 0.12) / 0.38, 0, 1);
    const t = clock.getElapsedTime();
    // Faróis pulsam dramaticamente quando acendem (p 0.1→0.4)
    const pulse = neonP < 0.6
      ? neonP * (1 + Math.sin(t * 8) * 0.4 * (1 - neonP / 0.6)) // flicker ao acender
      : neonP * (1 + Math.sin(t * 1.1) * 0.08);                  // pulso suave depois

    refs.forEach((r) => {
      if (r.current) r.current.material.emissiveIntensity = pulse * 6;
    });
  });

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} ref={refs[i]} position={pos} rotation={[0, i === 2 ? Math.PI / 2 : 0, 0]}>
          <boxGeometry args={[2.5, 0.04, 0.04]} />
          <meshStandardMaterial color="#2B4CFF" emissive="#2B4CFF" emissiveIntensity={0} roughness={0} metalness={1} />
        </mesh>
      ))}
    </>
  );
}

// ── Partículas — surgem com o scroll ─────────────────────────────
function DustParticles({ progressRef }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const p = progressRef.current;
    ref.current.material.opacity = THREE.MathUtils.lerp(0, 0.45, Math.min((p - 0.2) * 3, 1));
  });
  return (
    <Sparkles
      ref={ref}
      count={80}
      scale={[8, 4, 4]}
      size={0.6}
      speed={0.3}
      color="#2B4CFF"
      opacity={0}
    />
  );
}

// ── Luzes da cena — controladas por scroll ────────────────────────
function SceneLights({ progressRef }) {
  const keyRef  = useRef();
  const rimLRef = useRef();
  const rimRRef = useRef();
  const ambRef  = useRef();

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const t = clock.getElapsedTime();

    // Ambient: quase zero no início, cresce com scroll
    if (ambRef.current)
      ambRef.current.intensity = THREE.MathUtils.lerp(0.02, 0.12, Math.min(p * 2, 1));

    // Key light azul: acende dramaticamente em p=0.1→0.45
    const keyP = THREE.MathUtils.clamp((p - 0.08) / 0.37, 0, 1);
    // Flicker ao acender
    const flicker = keyP < 0.5
      ? keyP * (1 + Math.sin(t * 12) * 0.5 * Math.max(0, 1 - keyP * 2))
      : keyP;
    if (keyRef.current)
      keyRef.current.intensity = flicker * 3.2 + Math.sin(t * 1.2) * 0.25 * keyP;

    // Rim lights: p=0.2→0.6
    const rimP = THREE.MathUtils.clamp((p - 0.18) / 0.42, 0, 1);
    if (rimLRef.current) rimLRef.current.intensity = rimP * 1.5;
    if (rimRRef.current) rimRRef.current.intensity = rimP * 1.0;
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.02} />
      <pointLight ref={keyRef}  position={[0, 3, 1]}    color="#2B4CFF" intensity={0}   distance={12} />
      <pointLight ref={rimLRef} position={[-4, 1, 0]}   color="#1a3aff" intensity={0}   distance={9}  />
      <pointLight ref={rimRRef} position={[4, 1.5, 0]}  color="#0a1aff" intensity={0}   distance={9}  />
      <pointLight               position={[0, -0.5, 2]} color="#ffffff" intensity={0.1} distance={5}  />
    </>
  );
}

// ── Câmera scroll-driven ─────────────────────────────────────────
function ScrollCamera({ progressRef }) {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const t = clock.getElapsedTime();

    // Estado inicial: câmera recuada + ângulo alto (carro escondido no escuro)
    // Estado final: zoom macro na grade frontal
    const zBase  = THREE.MathUtils.lerp(6.0, 4.8, Math.min(p * 2, 1));
    const yBase  = THREE.MathUtils.lerp(1.5, 0.9, Math.min(p * 2, 1));
    const swing  = Math.sin(t * 0.08) * 0.2 * (0.4 + p * 0.6);

    camera.position.set(swing, yBase, zBase);
    camera.fov = THREE.MathUtils.lerp(48, 36, Math.min(p * 1.8, 1));
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0.1, 0);
  });

  return null;
}

// ── Bloom dinâmico — intensidade controlada por scroll ─────────────
function DynamicPostFX({ progressRef }) {
  // Não tem acesso direto a instâncias dos effects do postprocessing,
  // mas o Bloom reage aos objetos emissivos — que já controlamos acima.
  // Aqui adicionamos apenas o composer estático.
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.18} luminanceSmoothing={0.88} intensity={2.2} mipmapBlur />
      <ChromaticAberration offset={[0.0008, 0.0008]} />
      <Vignette eskil={false} offset={0.08} darkness={0.9} />
    </EffectComposer>
  );
}

// ── Export: aceita progressRef via forwardRef ────────────────────
const HeroSceneInner = forwardRef(function HeroSceneInner({ progressRef }, _ref) {
  return (
    <div className="hero-canvas-wrapper">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.5, 6.0], fov: 48 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.88,
        }}
        style={{ background: '#121212' }}
      >
        <fog attach="fog" args={['#0a0a12', 9, 22]} />

        <ScrollCamera   progressRef={progressRef} />
        <SceneLights    progressRef={progressRef} />

        <Suspense fallback={null}>
          <Environment preset="night" />
          <CarPlane      progressRef={progressRef} />
          <StudioFloor   progressRef={progressRef} />
          <NeonLights    progressRef={progressRef} />
          <DustParticles progressRef={progressRef} />
        </Suspense>

        <DynamicPostFX progressRef={progressRef} />
      </Canvas>
    </div>
  );
});

export default HeroSceneInner;
