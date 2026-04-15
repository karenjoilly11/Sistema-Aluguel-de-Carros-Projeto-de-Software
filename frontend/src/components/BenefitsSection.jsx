import { motion } from 'framer-motion';

const BENEFITS = [
  {
    num: '01',
    title: 'Frota sempre revisada',
    desc: 'Cada veículo passa por inspeção em 120 pontos antes de sair para locação. Mecânica, elétrica e acabamento.',
  },
  {
    num: '02',
    title: 'Entrega em 2 horas',
    desc: 'O carro vai até você. Escolha o endereço — aeroporto, hotel ou residência — e confirmamos o horário.',
  },
  {
    num: '03',
    title: 'Seguro total incluso',
    desc: 'Cobertura completa em todos os planos, sem franquia surpresa. Você dirige, a gente cobre.',
  },
  {
    num: '04',
    title: 'Sem burocracia',
    desc: 'Reserva 100% online em menos de 3 minutos. Cancelamento gratuito até 12 horas antes.',
  },
  {
    num: '05',
    title: 'Suporte 24 horas',
    desc: 'Equipe disponível a qualquer hora. Pane, acidente ou dúvida — respondemos em menos de 5 minutos.',
  },
  {
    num: '06',
    title: 'Assinatura mensal',
    desc: 'Troque de modelo a cada semana dentro do mesmo plano. Acesso rotativo a toda a frota.',
  },
];

export default function BenefitsSection() {
  return (
    <section className="benefits-section" id="beneficios">

      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-tag">Por que a Spirit Motors</span>
          <h2 className="section-title">
            O que nos torna <span className="accent-text">diferentes</span>
          </h2>
        </motion.div>

        <div className="benefits-grid">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.num}
              className="benefit-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <span className="benefit-num">{b.num}</span>
              <h3 className="benefit-title">{b.title}</h3>
              <p className="benefit-desc">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
