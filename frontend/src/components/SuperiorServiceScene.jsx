import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

// ── Plano principal: capô/grade do Mercedes (foto Carros.jpg) ──
function MercedesPlane() {
  const texture = useTexture('/carros/mercedes 1.jpg');
  const meshRef = useRef();
  const matRef  = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Respiração lenta de câmera: pequeno bob + leve rotação
    meshRef.current.rotation.y = Math.sin(t * 0.12) * 0.06;
    meshRef.current.position.y = Math.sin(t * 0.35) * 0.025;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[5.8, 3.4]} />
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        roughness={0.08}
        metalness={0.75}
        envMapIntensity={2.2}
      />
    </mesh>
  );
}

// ── Laser scan: linha fina que varre lentamente da esquerda para direita ──
function LaserScan() {
  const laserRef = useRef();
  const glowRef  = useRef();
  const trailRef = useRef();

  // Geometria da linha laser (plano finíssimo, altura = quadro)
  const laserGeo = useMemo(() => new THREE.PlaneGeometry(0.018, 3.6), []);
  const glowGeo  = useMemo(() => new THREE.PlaneGeometry(0.12, 3.6), []);

  // Material emissivo azul para o núcleo do laser
  const laserMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#2B4CFF',
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  // Material glow suave
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#2B4CFF',
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  // Trail: região já varrida — overlay escuro que vai "revelando"
  const trailMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#000008',
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }), []);

  const HALF_W = 2.9; // metade da largura do plano

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Ciclo de 8 segundos: vai e vem
    const cycle = (t % 8) / 8;           // 0 → 1
    const ping  = cycle < 0.5
      ? cycle * 2                         // 0 → 1 (ida)
      : 2 - cycle * 2;                   // 1 → 0 (volta)

    const x = -HALF_W + ping * HALF_W * 2;

    if (laserRef.current) laserRef.current.position.x = x;
    if (glowRef.current)  glowRef.current.position.x  = x;

    // Trail cobre a parte não revelada (à direita na ida)
    if (trailRef.current) {
      const coverW = (1 - ping) * HALF_W * 2;
      trailRef.current.scale.x = coverW / (HALF_W * 2) || 0.001;
      trailRef.current.position.x = x + coverW / 2;
    }
  });

  return (
    <group position={[0, 0, 0.01]}>
      {/* Núcleo do laser */}
      <mesh ref={laserRef} geometry={laserGeo} material={laserMat} />
      {/* Halo suave ao redor */}
      <mesh ref={glowRef}  geometry={glowGeo}  material={glowMat} />
      {/* Véu escuro cobrindo a parte não revelada */}
      <mesh
        ref={trailRef}
        position={[HALF_W, 0, -0.005]}
      >
        <planeGeometry args={[HALF_W * 2, 3.6]} />
        <primitive object={trailMat} attach="material" />
      </mesh>
    </group>
  );
}

// ── Partículas de faíscas flutuando no scan ──
function ScanSparks() {
  return (
    <Sparkles
      count={40}
      scale={[6, 3.5, 0.5]}
      size={1.2}
      speed={0.5}
      color="#2B4CFF"
      opacity={0.6}
    />
  );
}

// ── Linhas de grade de carbono (sobreposição 3D estilizada) ──
function CarbonGrid() {
  const lines = useMemo(() => {
    const pts = [];
    // Linhas horizontais
    for (let y = -1.6; y <= 1.6; y += 0.22) {
      pts.push(new THREE.Vector3(-2.9, y, 0.02), new THREE.Vector3(2.9, y, 0.02));
    }
    // Linhas verticais
    for (let x = -2.9; x <= 2.9; x += 0.22) {
      pts.push(new THREE.Vector3(x, -1.6, 0.02), new THREE.Vector3(x, 1.6, 0.02));
    }
    return pts;
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(lines);
    return g;
  }, [lines]);

  const mat = useMemo(() => new THREE.LineBasicMaterial({
    color: '#2B4CFF',
    transparent: true,
    opacity: 0.055,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  return <lineSegments geometry={geo} material={mat} />;
}

// ── Luzes da cena ──
function SceneLights() {
  const pulseLightRef = useRef();

  useFrame(({ clock }) => {
    if (!pulseLightRef.current) return;
    const t = clock.getElapsedTime();
    pulseLightRef.current.intensity = 1.8 + Math.sin(t * 2.4) * 0.3;
  });

  return (
    <>
      <ambientLight intensity={0.04} />
      {/* Laser key light azul frontal */}
      <pointLight
        ref={pulseLightRef}
        position={[0, 0, 3]}
        color="#2B4CFF"
        intensity={1.8}
        distance={8}
      />
      {/* Rim lateral esquerdo */}
      <pointLight position={[-3.5, 1, 1]} color="#1a2fff" intensity={0.9} distance={7} />
      {/* Rim lateral direito */}
      <pointLight position={[3.5, -0.5, 1]} color="#0a1aff" intensity={0.6} distance={7} />
      {/* Fill frio muito suave de baixo */}
      <pointLight position={[0, -2.5, 2]} color="#0d0d2a" intensity={0.4} distance={6} />
    </>
  );
}

// ── Câmera com drift cinematográfico ──
function CinematicCamera() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    // Zoom macro lento — câmera se aproxima e depois recua
    const zoom = 5.2 + Math.sin(t * 0.08) * 0.35;
    camera.position.set(
      Math.sin(t * 0.06) * 0.25,
      Math.sin(t * 0.04) * 0.12 + 0.05,
      zoom,
    );
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Cena principal exportada ──
export default function SuperiorServiceScene() {
  return (
    <div className="superior-canvas-wrapper">
      <Canvas
        shadows={false}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5.2], fov: 36 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
        style={{ background: '#121212' }}
      >
        <fog attach="fog" args={['#080810', 10, 22]} />
        <CinematicCamera />
        <SceneLights />

        <Suspense fallback={null}>
          <Environment preset="night" />
          <MercedesPlane />
          <LaserScan />
          <CarbonGrid />
          <ScanSparks />
        </Suspense>

        <EffectComposer>
          <DepthOfField
            focusDistance={0}
            focalLength={0.025}
            bokehScale={2.5}
          />
          <Bloom
            luminanceThreshold={0.15}
            luminanceSmoothing={0.85}
            intensity={2.4}
            mipmapBlur
          />
          <ChromaticAberration offset={[0.0012, 0.0012]} />
          <Vignette eskil={false} offset={0.08} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
