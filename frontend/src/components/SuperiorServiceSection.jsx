import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const SuperiorServiceScene = lazy(() => import('./SuperiorServiceScene'));

const PILLARS = [
  {
    number: '01',
    title: 'Engenharia de Elite',
    desc: 'Cada veículo é uma obra de engenharia. Carbon fiber, aerodinâmica ativa e motores de competição — disponíveis para você.',
  },
  {
    number: '02',
    title: 'Detalhamento Milimétrico',
    desc: 'Inspeção em 120 pontos antes de cada locação. Acabamento impecável, interior sem uma marca, máquina pronta para performar.',
  },
  {
    number: '03',
    title: 'Experiência Única',
    desc: 'Não entregamos apenas um carro. Entregamos a sensação de dominar o asfalto com uma máquina que pouquíssimos já pilotaram.',
  },
];

export default function SuperiorServiceSection() {
  return (
    <section className="superior-section" id="sobre">
      {/* Glow ambiente azul */}
      <div className="superior-ambient" aria-hidden="true" />

      <div className="superior-inner">

        {/* ── Painel esquerdo: cena 3D — sem parallax para não brigar com o canvas ── */}
        <div className="superior-visual">
          <div className="superior-canvas-frame">
            {/* Badge "MACRO DETAIL" sobreposto */}
            <div className="superior-frame-label">
              <span className="superior-frame-dot" />
              MACRO DETAIL · AMG
            </div>

            <Suspense fallback={
              <div className="superior-canvas-fallback">
                <div className="hero-spinner" />
              </div>
            }>
              <SuperiorServiceScene />
            </Suspense>

            {/* Borda neon inferior */}
            <div className="superior-frame-neon" />
          </div>

          {/* Stats flutuantes abaixo do canvas */}
          <div className="superior-mini-stats">
            {[
              { val: '120', label: 'pontos inspecionados' },
              { val: '< 2h', label: 'tempo de entrega' },
              { val: '5★', label: 'avaliação média' },
            ].map((s) => (
              <motion.div
                key={s.label}
                className="superior-mini-stat"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <span className="superior-mini-val">{s.val}</span>
                <span className="superior-mini-label">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Painel direito: texto ── */}
        <div className="superior-content">
          <motion.span
            className="section-tag"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Sobre Nós
          </motion.span>

          <motion.h2
            className="superior-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Superior<br />
            <span className="accent-text">Service</span>
          </motion.h2>

          <motion.p
            className="superior-lead"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Trabalhamos exclusivamente com máquinas de elite. Cada detalhe —
            desde o carbon fiber da carroceria até a costura do volante —
            é selecionado para elevar sua experiência além do comum.
          </motion.p>

          {/* Pilares */}
          <div className="superior-pillars">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.number}
                className="superior-pillar"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.65, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="superior-pillar-num">{p.number}</span>
                <div>
                  <h3 className="superior-pillar-title">{p.title}</h3>
                  <p className="superior-pillar-desc">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA inline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <a href="#frota" className="btn-primary-hero" style={{ marginTop: '36px', display: 'inline-flex' }}>
              Conhecer a Frota
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
