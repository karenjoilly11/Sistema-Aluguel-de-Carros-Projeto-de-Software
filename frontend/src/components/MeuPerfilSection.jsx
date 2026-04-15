import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const STATUS_CORES = {
  PENDENTE:  { bg: '#78350f', color: '#fcd34d' },
  APROVADO:  { bg: '#14532d', color: '#4ade80' },
  CANCELADO: { bg: '#450a0a', color: '#f87171' },
  CONCLUIDO: { bg: '#1e3a5f', color: '#60a5fa' },
};

function StatusBadge({ status }) {
  const s = STATUS_CORES[status] ?? { bg: '#27272a', color: '#a1a1aa' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
      {status}
    </span>
  );
}

function fmtMoeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(d) {
  if (!d) return '—';
  const [y, m, dia] = d.split('-');
  return `${dia}/${m}/${y}`;
}

export default function MeuPerfilSection() {
  const { user, token } = useAuth();
  const [pedidos, setPedidos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [online, setOnline]     = useState(true);

  // Busca os pedidos do cliente pelo email — primeiro encontra o cliente pelo email
  const carregarPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
      // Busca todos os clientes e filtra pelo email do usuário logado
      const clientes = await fetch('/clientes', { headers }).then((r) => r.ok ? r.json() : []);
      const eu = clientes.find((c) => c.email === user?.email);
      if (eu) {
        const meusPedidos = await fetch(`/pedidos/cliente/${eu.id}`, { headers }).then((r) => r.ok ? r.json() : []);
        setPedidos(meusPedidos);
      } else {
        setPedidos([]);
      }
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => { carregarPedidos(); }, [carregarPedidos]);

  return (
    <section className="sistema-section">
      <div className="sistema-ambient" aria-hidden="true" />
      <div className="section-container">

        {/* Header */}
        <motion.div className="section-header"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Área do Cliente</span>
          <h2 className="section-title">Olá, <span className="accent-text">{user?.nome?.split(' ')[0]}</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>{user?.email}</p>
        </motion.div>

        {/* Card de perfil */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
            padding: '28px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24,
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-dim)',
            border: '2px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 700, color: 'var(--blue)', flexShrink: 0,
          }}>
            {user?.nome?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>{user?.nome}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{user?.email}</p>
          </div>
          <span style={{
            background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid rgba(43,76,255,0.3)',
            padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
          }}>
            {user?.role}
          </span>
        </motion.div>

        {/* Meus pedidos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>Meus Pedidos</h3>
            <button className="sis-btn-refresh" onClick={carregarPedidos} title="Recarregar">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M11 6.5A4.5 4.5 0 012.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M2 6.5A4.5 4.5 0 0110.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M2 9.5V6.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 3.5V6.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="sistema-table-wrapper">
            {loading && <div className="sistema-loading"><div className="hero-spinner" /> Carregando pedidos…</div>}

            {!loading && !online && (
              <div className="sistema-offline">
                <p>Não foi possível conectar ao backend.</p>
                <button className="btn-secondary-hero" style={{ fontSize: 13, marginTop: 12 }} onClick={carregarPedidos}>Tentar novamente</button>
              </div>
            )}

            {!loading && online && pedidos.length === 0 && (
              <div className="sistema-empty" style={{ padding: '40px 0', textAlign: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
                  <rect x="8" y="6" width="24" height="28" rx="3" stroke="#3f3f46" strokeWidth="1.5"/>
                  <path d="M14 14h12M14 20h12M14 26h8" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p style={{ color: 'var(--text-muted)' }}>Você ainda não tem pedidos de aluguel.</p>
              </div>
            )}

            {!loading && online && pedidos.length > 0 && (
              <table className="sistema-table">
                <thead>
                  <tr>
                    <th className="sis-th">#</th>
                    <th className="sis-th">Automóvel</th>
                    <th className="sis-th sis-hidden-sm">Retirada</th>
                    <th className="sis-th sis-hidden-sm">Devolução</th>
                    <th className="sis-th">Valor</th>
                    <th className="sis-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id} className="sis-row">
                      <td className="sis-td sis-td--id">{p.id}</td>
                      <td className="sis-td">
                        {p.automovel ? `${p.automovel.marca} ${p.automovel.modelo}` : '—'}
                      </td>
                      <td className="sis-td sis-hidden-sm">{fmtData(p.dataInicio)}</td>
                      <td className="sis-td sis-hidden-sm">{fmtData(p.dataFim)}</td>
                      <td className="sis-td">{p.valorTotal != null ? fmtMoeda(p.valorTotal) : '—'}</td>
                      <td className="sis-td"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
