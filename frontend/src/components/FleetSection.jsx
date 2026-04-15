import { useRef, useCallback, memo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const FLEET = [
  {
    name: 'Audi RS6',
    category: 'Sport',
    price: 'R$ 890',
    img: '/carros/audi rs6 fosco.jpg',
    specs: ['4.0 V8 Biturbo', '630 cv', '0–100 em 3,4s'],
  },
  {
    name: 'Lamborghini Huracán',
    category: 'Supercar',
    price: 'R$ 2.400',
    img: '/carros/huracan verde.jpg',
    specs: ['5.2 V10', '640 cv', '0–100 em 2,9s'],
  },
  {
    name: 'Lamborghini Urus',
    category: 'SUV Sport',
    price: 'R$ 1.600',
    img: '/carros/lambo italy.webp',
    specs: ['4.0 V8 Twin-Turbo', '650 cv', '0–100 em 3,6s'],
  },
  {
    name: 'Mercedes AMG',
    category: 'Luxury',
    price: 'R$ 1.100',
    img: '/carros/mercedes 1.jpg',
    specs: ['4.0 V8 Biturbo', '510 cv', '0–100 em 3,7s'],
  },
];

const FleetCard = memo(function FleetCard({ car, index }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-80, 80], [10, -10]);
  const rotateY = useTransform(x, [-80, 80], [-10, 10]);
  const glareX  = useTransform(x, [-80, 80], [0, 100]);
  const glareY  = useTransform(y, [-80, 80], [0, 100]);

  // damping maior = movimento mais suave, menos trabalho de RAF
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
        <img src={car.img} alt={car.name} className="fleet-card-img" loading="lazy" />
        <div className="fleet-card-img-overlay" />
      </div>

      {/* Info */}
      <div className="fleet-card-body" style={{ transform: 'translateZ(20px)' }}>
        <div className="fleet-card-top">
          <span className="fleet-card-category">
            {car.category}
          </span>
          <span className="fleet-card-price">
            {car.price}<small>/dia</small>
          </span>
        </div>
        <h3 className="fleet-card-name">{car.name}</h3>

        <ul className="fleet-card-specs">
          {car.specs.map((s) => (
            <li key={s}>
              <span className="fleet-spec-dot" />
              {s}
            </li>
          ))}
        </ul>

        <button
          className="fleet-card-btn"
          onClick={() => document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Reservar
        </button>
      </div>
    </motion.div>
  );
});

export default function FleetSection() {
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
          {FLEET.map((car, i) => (
            <FleetCard key={car.name} car={car} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
