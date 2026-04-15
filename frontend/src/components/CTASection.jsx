import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="cta-section" id="reservar">
      <div className="cta-glow" aria-hidden="true" />

      <div className="section-container">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="cta-neon-line cta-neon-line--top" />
          <div className="cta-neon-line cta-neon-line--bottom" />

          <div className="cta-body">
            <div className="cta-text">
              <span className="section-tag">Acesso ao sistema</span>
              <h2 className="cta-title">
                Entre e gerencie<br />
                <span className="accent-text">sua frota</span>
              </h2>
              <p className="cta-desc">
                Cadastre clientes, registre contratos e acompanhe locações
                pelo painel administrativo.
              </p>
            </div>

            <div className="cta-actions">
              <a href="/login" className="btn-primary-hero">
                Acessar o sistema
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#frota" className="btn-secondary-hero">
                Ver frota
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
