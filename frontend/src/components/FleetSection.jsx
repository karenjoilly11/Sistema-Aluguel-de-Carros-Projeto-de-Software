import { useRef, useCallback, memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// Imagens fallback por categoria/index
const FALLBACK_IMGS = [
  '/carros/audi rs6 fosco.jpg',
  '/carros/huracan verde.jpg',
  '/carros/lambo italy.webp',
  '/carros/mercedes 1.jpg',
];

function fmtMoeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const FleetCard = memo(function FleetCard({ car, index }) {
  const navigate = useNavigate();
  const cardRef  = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-80, 80], [10, -10]);
  const rotateY = useTransform(x, [-80, 80], [-10, 10]);
  const glareX  = useTransform(x, [-80, 80], [0, 100]);
  const glareY  = useTransform(y, [-80, 80], [0, 100]);

  const rotateXSpring = useSpring(rotateX, { stiffness: 120, damping: 28 });
  const rotateYSpring = useSpring(rotateY, { stiffness: 120, damping: 28 });

  const rafRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }
      rafRef.current = null;
    });
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    x.set(0);
    y.set(0);
  }, [x, y]);

  const [imgError, setImgError] = useState(false);
  const imgSrc = car.urlFoto && !imgError ? car.urlFoto : FALLBACK_IMGS[index % FALLBACK_IMGS.length];

  return (
    <motion.div
      ref={cardRef}
      className="fleet-card"
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glare overlay */}
      <motion.div
        className="fleet-card-glare"
        style={{
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(43,76,255,0.18) 0%, transparent 65%)`,
        }}
      />

      {/* Imagem */}
      <div className="fleet-card-img-wrapper">
        <img src={imgSrc} alt={`${car.marca} ${car.modelo}`} className="fleet-card-img" loading="lazy" onError={() => setImgError(true)} />
        <div className="fleet-card-img-overlay" />
      </div>

      {/* Info */}
      <div className="fleet-card-body" style={{ transform: 'translateZ(20px)' }}>
        <div className="fleet-card-top">
          <span className="fleet-card-category">
            {car.ano ?? 'Premium'}
          </span>
          <span className="fleet-card-price">
            {fmtMoeda(car.valorDiaria)}<small>/dia</small>
          </span>
        </div>
        <h3 className="fleet-card-name">{car.marca} {car.modelo}</h3>

        <ul className="fleet-card-specs">
          <li><span className="fleet-spec-dot" />Placa: {car.placa}</li>
          {car.cor && <li><span className="fleet-spec-dot" />Cor: {car.cor}</li>}
          <li>
            <span className="fleet-spec-dot" />
            {car.disponivel ? 'Disponível para aluguel' : 'Indisponível no momento'}
          </li>
        </ul>

        <button
          className="fleet-card-btn"
          onClick={() => navigate('/registro')}
        >
          Reservar
        </button>
      </div>
    </motion.div>
  );
});

// Skeleton card para o estado de loading
function SkeletonCard({ index }) {
  return (
    <motion.div
      className="fleet-card"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="fleet-card-img-wrapper" style={{ background: 'var(--bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div className="fleet-card-body" style={{ gap: 10 }}>
        <div style={{ height: 14, width: '60%', background: 'var(--bg-elevated)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 20, width: '80%', background: 'var(--bg-elevated)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 14, width: '50%', background: 'var(--bg-elevated)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </motion.div>
  );
}

export default function FleetSection() {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/automoveis')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        // Mostra somente disponíveis na landing page, até 4 carros
        const disponiveis = data.filter((c) => c.disponivel !== false).slice(0, 4);
        setCarros(disponiveis.length > 0 ? disponiveis : data.slice(0, 4));
      })
      .catch(() => setCarros([]))
      .finally(() => setLoading(false));
  }, []);

  // Se não há carros no banco, não renderiza a seção
  if (!loading && carros.length === 0) return null;

  return (
    <section className="fleet-section" id="frota">
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag">Nossa Frota</span>
          <h2 className="section-title">
            Veículos que <span className="accent-text">definem</span> o padrão
          </h2>
          <p className="section-desc">
            Cada veículo é minuciosamente preparado para oferecer a experiência
            de condução mais sofisticada possível.
          </p>
        </motion.div>

        {/* Grid de carros */}
        <div className="fleet-grid">
          {loading
            ? [0, 1, 2, 3].map((i) => <SkeletonCard key={i} index={i} />)
            : carros.map((car, i) => <FleetCard key={car.id} car={car} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}
