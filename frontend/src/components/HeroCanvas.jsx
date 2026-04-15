import { useEffect, useRef, useState } from 'react';

export default function HeroCanvas({ progress }) {
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const [loaded, setLoaded] = useState(false);
  const totalFrames = 192;

  useEffect(() => {
    let imagesLoaded = 0;
    const images = [];

    // Pre-load de todas as imagens para a memória
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const num = String(i).padStart(3, '0');
      img.src = `/carros/hero_sequence/frame_${num}.jpg`;

      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalFrames) {
          framesRef.current = images;
          setLoaded(true);
        }
      };

      img.onerror = () => {
        imagesLoaded++;
        if (imagesLoaded === totalFrames) {
          framesRef.current = images;
          setLoaded(true);
        }
      };

      images.push(img);
    }
  }, []);

  useEffect(() => {
    // Só prossegue se os frames carregaram e a prop de progressão do Scroll chegou do HeroSection
    if (!loaded || !canvasRef.current || framesRef.current.length === 0 || !progress) return;

    const canvas = canvasRef.current;

    // Melhoria 2: desynchronized passa o desenho pro HW mais rápido
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

    // A resolução nativa de fundo
    canvas.width = 1920;
    canvas.height = 1080;

    // Melhoria 2: Engine de Anti-Aliasing Suave Ativado! Serrilhados off.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const renderFrame = (index) => {
      const img = framesRef.current[index];
      if (img && img.complete && img.naturalWidth !== 0) {
        // Garantindo que a suavização de upscale seja mantida a cada redesenho
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    // Mostra o frame inicial logo de cara para não ficar preto enquanto não mexe
    renderFrame(0);

    // Melhoria 3: O Verdadeiro Scrollytelling Apple.
    // Transforma a porcentagem da roda do mouse/trackpad no índice da imagem (0 a 191)
    const unsubscribe = progress.on('change', (latest) => {
      const frameIndex = Math.min(Math.floor(latest * totalFrames), totalFrames - 1);

      // Delega para o monitor atualizar no próximo ciclo mais fluido possível
      requestAnimationFrame(() => renderFrame(Math.max(0, frameIndex)));
    });

    return () => unsubscribe();
  }, [loaded, progress]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="hero-video"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.6s ease-in',
          willChange: 'opacity'
        }}
      />
    </>
  );
}
