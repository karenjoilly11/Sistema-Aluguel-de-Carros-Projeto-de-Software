import { lazy, Suspense, useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PartsScene = lazy(() => import('./PartsScene'));

// ── Serviços detalhados ──────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'curta',
    focus: 'disc',
    tag: 'Diária / Weekend',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M11 6v5l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Locação de Curta Duração',
    subtitle: 'De 1 a 6 dias',
    desc: 'Ideal para eventos, viagens de negócio ou simplesmente sentir a adrenalina no fim de semana. Sem franquia de quilometragem para destinos regionais.',
    details: [
      'Seguro total incluso',
      'Entrega em 2h no endereço escolhido',
      'Suporte 24/7 com assistência em pista',
      'Sem taxa de cancelamento até 12h antes',
    ],
    price: 'A partir de R$ 890/dia',
    accent: '#2B4CFF',
  },
  {
    id: 'media',
    focus: 'both',
    tag: 'Weekly / Mensal',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M3 9h16M8 2v4M14 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M7 13h2m2 0h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Locação de Média Duração',
    subtitle: '7 a 29 dias',
    desc: 'Para projetos, temporadas ou quem quer explorar mais sem compromisso de compra. Quilometragem livre e troca de veículo a cada 15 dias sem custo adicional.',
    details: [
      'Quilometragem ilimitada',
      'Troca de veículo mid-period inclusa',
      'Manutenção preventiva coberta',
      'Desconto de 18% sobre a diária padrão',
    ],
    price: 'A partir de R$ 680/dia',
    accent: '#2B4CFF',
  },
  {
    id: 'longa',
    focus: 'wing',
    tag: 'Subscription',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11h14M13 5l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="7" cy="11" r="2" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
    title: 'Assinatura Premium',
    subtitle: '30+ dias',
    desc: 'Nosso modelo de subscripção exclusivo. Você paga um valor fixo mensal e tem acesso rotativo a toda a frota — dirija um modelo diferente toda semana se quiser.',
    details: [
      'Acesso rotativo à frota completa',
      'IPVA, seguro e revisão inclusos',
      'Motorista substituto disponível',
      'Concierge automotivo personalizado',
    ],
    price: 'A partir de R$ 14.900/mês',
    accent: '#2B4CFF',
  },
  {
    id: 'evento',
    focus: 'disc',
    tag: 'Events & Corporate',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3l2.5 5 5.5.8-4 3.9.9 5.5L11 16l-4.9 2.2.9-5.5-4-3.9 5.5-.8L11 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Eventos & Corporativo',
    subtitle: 'Sob medida',
    desc: 'Frota dedicada para casamentos, lançamentos, filmagens ou eventos corporativos. Coordenação completa com equipe especializada e choferes certificados.',
    details: [
      'Branding e personalização disponíveis',
      'Motoristas bilíngues certificados',
      'Coordenação logística completa',
      'NF e faturamento corporativo',
    ],
    price: 'Orçamento personalizado',
    accent: '#2B4CFF',
  },
];

// ── Card de serviço ──────────────────────────────────────────────────────────
const ServiceCard = memo(function ServiceCard({ service, index, isActive, onClick }) {
  return (
    <motion.button
      className={`service-card${isActive ? ' service-card--active' : ''}`}
      onClick={() => onClick(service.id)}
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 4 }}
      style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <div className="service-card-inner">
        {/* Indicador lateral */}
        <div className="service-card-bar" />

        <div className="service-card-body">
          <div className="service-card-header">
            <span className="service-card-icon" style={{ color: isActive ? '#2B4CFF' : 'rgba(240,240,240,0.4)' }}>
              {service.icon}
            </span>
            <div>
              <span className="service-card-tag">{service.tag}</span>
              <h3 className="service-card-title">{service.title}</h3>
              <span className="service-card-subtitle">{service.subtitle}</span>
            </div>
          </div>

          <AnimatePresence>
            {isActive && (
              <motion.div
                className="service-card-expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="service-card-desc">{service.desc}</p>
                <ul className="service-card-details">
                  {service.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <span className="service-card-price">{service.price}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.button>
  );
});

// ── Seção principal ──────────────────────────────────────────────────────────
export default function ServicesSection() {
  const [activeId, setActiveId] = useState('curta');
  const activeService = SERVICES.find((s) => s.id === activeId);
  const handleClick = useCallback((id) => setActiveId(id), []);

  return (
    <section className="services-section" id="servicos">

      <div className="section-container">
        {/* Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag">Nossos Serviços</span>
          <h2 className="section-title">
            Cada detalhe <span className="accent-text">projetado</span> para você
          </h2>
          <p className="section-desc">
            Do disco de freio cerâmico à asa de carbono aerodinâmica —
            nossos veículos são mantidos no mesmo nível em que saem de fábrica.
          </p>
        </motion.div>

        {/* Layout: lista esquerda + visual direita */}
        <div className="services-layout">

          {/* ── Lista de serviços ── */}
          <div className="services-list">
            {SERVICES.map((s, i) => (
              <ServiceCard
                key={s.id}
                service={s}
                index={i}
                isActive={activeId === s.id}
                onClick={handleClick}
              />
            ))}
          </div>

          {/* ── Painel visual direito ── */}
          <div className="services-visual">
            <motion.div
              className="services-scene-frame"
              key={activeId}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Badge do foco ativo */}
              <div className="services-scene-badge">
                <span className="superior-frame-dot" />
                {activeService?.tag?.toUpperCase()}
              </div>

              <Suspense fallback={
                <div className="services-canvas-fallback">
                  <div className="hero-spinner" />
                </div>
              }>
                <PartsScene focus={activeService?.focus ?? 'both'} />
              </Suspense>

              {/* Linha neon inferior */}
              <div className="services-scene-neon" />
            </motion.div>

            {/* Nota técnica */}
            <motion.div
              className="services-tech-note"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#2B4CFF" strokeWidth="1.2"/>
                <path d="M7 5v4M7 4.5v.2" stroke="#2B4CFF" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span>
                Asa de fibra de carbono aeronáutico &amp; disco cerâmico Brembo CCM-R —
                peças reais dos veículos da nossa frota, recriadas em 3D.
              </span>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
