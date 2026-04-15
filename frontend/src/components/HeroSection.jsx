import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroCanvas from './HeroCanvas';

export default function HeroSection() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
    layoutEffect: false,
  });

  const uiOpacity    = useTransform(scrollYProgress, [0, 0.05, 0.35], [1, 1, 0]);
  const uiY          = useTransform(scrollYProgress, [0, 0.35], [0, -40]);

  return (
    <section className="hero-section" ref={sectionRef} id="hero">
      <div className="hero-sticky">
      <HeroCanvas progress={scrollYProgress} />

      <div className="hero-overlay" />
      <div className="hero-gradient-bottom" />

      <motion.div className="hero-ui" style={{ opacity: uiOpacity, y: uiY }}>
        <div className="hero-ui-inner">

          <motion.p
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Aluguel de carros de alto padrão
          </motion.p>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="hero-title-line">Máquinas</span>
            <span className="hero-title-accent">de elite.</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            Entrega em até 2 horas no endereço que você escolher.
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
          >
            <a href="#frota" className="btn-primary-hero">
              Ver frota
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#sobre" className="btn-secondary-hero">Sobre nós</a>
          </motion.div>

        </div>
      </motion.div>

      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        style={{ opacity: uiOpacity }}
      >
        <motion.div
          className="hero-scroll-dot"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      </div>
    </section>
  );
}
