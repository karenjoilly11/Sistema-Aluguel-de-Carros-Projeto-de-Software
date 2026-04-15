import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const STATUS_CORES = {
  PENDENTE: { bg: '#78350f', color: '#fcd34d' },
  APROVADO: { bg: '#14532d', color: '#4ade80' },
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

export default function AgentesSection() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [analisando, setAnalisando] = useState(null);
  const [aprovando, setAprovando] = useState(null);
  const [toast, setToast] = useState(null);

  const apiFetch = useCallback((url, opts = {}) => {
    return fetch(url, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
    });
  }, [token]);

  const showToast = useCallback((msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const carregarPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/pedidos/todos').then(r => r.ok ? r.json() : []);
      // Filtra apenas pedidos PENDENTE para análise
      setPedidos(data.filter(p => p.status === 'PENDENTE'));
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  async function analisarPedido(id) {
    setAnalisando(id);
    try {
      const r = await apiFetch(`/pedidos/${id}/analise-financeira`);
      const aprovado = await r.json();

      if (aprovado) {
        showToast('✓ Análise financeira aprovada!');
      } else {
        showToast('✗ Renda insuficiente ou sem rendimentos informados.', 'err');
      }

      // Recarrega a lista
      await carregarPedidos();
    } catch {
      showToast('Erro ao analisar pedido.', 'err');
    } finally {
      setAnalisando(null);
    }
  }

  async function aprovarPedido(id) {
    setAprovando(id);
    try {
      const r = await apiFetch(`/pedidos/${id}/contrato`, { method: 'POST' });
      if (r.ok) {
        showToast('Contrato gerado com sucesso!');
        await carregarPedidos();
      } else {
        showToast('Erro ao gerar contrato.', 'err');
      }
    } catch {
      showToast('Erro ao conectar ao servidor.', 'err');
    } finally {
      setAprovando(null);
    }
  }

  return (
    <section className="sistema-section">
      <div className="sistema-ambient" aria-hidden="true" />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 999,
            background: toast.tipo === 'ok' ? '#14532d' : '#450a0a',
            color: toast.tipo === 'ok' ? '#4ade80' : '#f87171',
            border: `1px solid ${toast.tipo === 'ok' ? '#166534' : '#7f1d1d'}`,
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {toast.msg}
        </div>
      )}

      <div className="section-container">
        {/* Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Análise de Pedidos</span>
          <h2 className="section-title">
            Pedidos <span className="accent-text">Pendentes</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
            Avalie a rentabilidade de cada cliente e aprove contratos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>
              Fila de Análise
            </h3>
            <button className="sis-btn-refresh" onClick={carregarPedidos} title="Recarregar">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M11 6.5A4.5 4.5 0 012.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M2 6.5A4.5 4.5 0 0110.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M2 9.5V6.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 3.5V6.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="sistema-table-wrapper">
            {loading && <div className="sistema-loading"><div className="hero-spinner" /> Carregando pedidos…</div>}

            {!loading && !online && (
              <div className="sistema-offline">
                <p>Não foi possível conectar ao backend.</p>
                <button className="btn-secondary-hero" style={{ fontSize: 13, marginTop: 12 }} onClick={carregarPedidos}>
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading && online && pedidos.length === 0 && (
              <div className="sistema-empty" style={{ padding: '48px 0', textAlign: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
                  <circle cx="24" cy="24" r="20" stroke="#3f3f46" strokeWidth="2" />
                  <path d="M24 16v8M24 32v2" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhum pedido aguardando análise.</p>
              </div>
            )}

            {!loading && online && pedidos.length > 0 && (
              <table className="sistema-table">
                <thead>
                  <tr>
                    <th className="sis-th">#</th>
                    <th className="sis-th">Cliente</th>
                    <th className="sis-th">Automóvel</th>
                    <th className="sis-th sis-hidden-sm">Retirada</th>
                    <th className="sis-th sis-hidden-sm">Devolução</th>
                    <th className="sis-th">Valor</th>
                    <th className="sis-th">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id} className="sis-row">
                      <td className="sis-td sis-td--id">{p.id}</td>
                      <td className="sis-td">{p.cliente?.nome || '—'}</td>
                      <td className="sis-td">
                        {p.automovel ? `${p.automovel.marca} ${p.automovel.modelo}` : '—'}
                      </td>
                      <td className="sis-td sis-hidden-sm">{fmtData(p.dataInicio)}</td>
                      <td className="sis-td sis-hidden-sm">{fmtData(p.dataFim)}</td>
                      <td className="sis-td">{p.valorTotal != null ? fmtMoeda(p.valorTotal) : '—'}</td>
                      <td className="sis-td sis-td--actions">
                        <button
                          className="sis-btn-edit"
                          onClick={() => analisarPedido(p.id)}
                          disabled={analisando === p.id}
                          title="Analisar financeira"
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#3b82f6',
                          }}
                        >
                          {analisando === p.id ? '…' : '📊'}
                        </button>
                        <button
                          className="sis-btn-edit"
                          onClick={() => aprovarPedido(p.id)}
                          disabled={aprovando === p.id}
                          title="Gerar contrato"
                          style={{
                            background: 'rgba(34,197,94,0.2)',
                            color: '#4ade80',
                          }}
                        >
                          {aprovando === p.id ? '…' : '✓'}
                        </button>
                      </td>
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
