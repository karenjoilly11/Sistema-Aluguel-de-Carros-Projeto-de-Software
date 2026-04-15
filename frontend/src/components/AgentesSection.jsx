import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const STATUS_CORES = {
  PENDENTE:  { bg: '#78350f', color: '#fcd34d' },
  APROVADO:  { bg: '#14532d', color: '#4ade80' },
  CANCELADO: { bg: '#450a0a', color: '#f87171' },
  CONCLUIDO: { bg: '#1e3a5f', color: '#60a5fa' },
};

function fmtMoeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(d) {
  if (!d) return '—';
  const [y, m, dia] = d.split('-');
  return `${dia}/${m}/${y}`;
}

// Modal com detalhes do pedido para análise
function DetalheModal({ pedido, onAprovar, onRejeitar, onClose }) {
  const [aprovando, setAprovando] = useState(false);
  const [rejeitando, setRejeitando] = useState(false);

  if (!pedido) return null;

  const rendaSuficiente = pedido.rendaInformada != null && pedido.valorTotal != null
    ? pedido.rendaInformada >= pedido.valorTotal * 3
    : null;

  return (
    <AnimatePresence>
      <motion.div className="cm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="cm-panel"
        style={{ maxWidth: 500 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
      >
        <div className="cm-neon-top" />
        <div className="cm-header">
          <h2 className="cm-title">Pedido #{pedido.id} — Análise</h2>
          <button className="cm-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="cm-body">
          <div style={{ display: 'grid', gap: 10 }}>

            {/* Info do pedido */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Info label="Cliente ID" value={pedido.clienteId} />
              <Info label="Automóvel ID" value={pedido.automovelId} />
              <Info label="Retirada" value={fmtData(pedido.dataInicio)} />
              <Info label="Devolução" value={fmtData(pedido.dataFim)} />
              <Info label="Valor Total" value={pedido.valorTotal != null ? fmtMoeda(pedido.valorTotal) : '—'} />
              <Info label="Status" value={
                <span style={{ background: STATUS_CORES[pedido.status]?.bg, color: STATUS_CORES[pedido.status]?.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  {pedido.status}
                </span>
              } />
            </div>

            {/* Separador */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 2 }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Dados do cliente
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Info label="CPF informado" value={pedido.cpfInformado || '—'} />
                <Info label="Renda mensal" value={pedido.rendaInformada != null ? fmtMoeda(pedido.rendaInformada) : '—'} />
              </div>

              {/* Indicador automático de renda */}
              {rendaSuficiente !== null && (
                <div style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  background: rendaSuficiente ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${rendaSuficiente ? '#166534' : '#7f1d1d'}`,
                  color: rendaSuficiente ? '#4ade80' : '#f87171',
                }}>
                  {rendaSuficiente
                    ? `✓ Renda suficiente — ${fmtMoeda(pedido.rendaInformada)} ≥ 3× ${fmtMoeda(pedido.valorTotal)}`
                    : `✗ Renda insuficiente — ${fmtMoeda(pedido.rendaInformada)} < 3× ${fmtMoeda(pedido.valorTotal)}`
                  }
                </div>
              )}

              {pedido.observacao && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Observação do cliente</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: 8 }}>
                    {pedido.observacao}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="cm-footer">
          <button
            className="btn-secondary-hero"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
            disabled={rejeitando || aprovando}
            onClick={async () => {
              setRejeitando(true);
              await onRejeitar(pedido.id);
              setRejeitando(false);
              onClose();
            }}
          >
            {rejeitando ? <span className="cm-spinner" /> : '✕ Rejeitar'}
          </button>
          <button
            className="btn-primary-hero"
            disabled={aprovando || rejeitando}
            onClick={async () => {
              setAprovando(true);
              await onAprovar(pedido.id);
              setAprovando(false);
              onClose();
            }}
          >
            {aprovando ? <span className="cm-spinner" /> : '✓ Aprovar'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function AgentesSection() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [toast, setToast] = useState(null);
  const [pedidoDetalhe, setPedidoDetalhe] = useState(null);

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
      setPedidos(data.filter(p => p.status === 'PENDENTE'));
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => { carregarPedidos(); }, [carregarPedidos]);

  async function aprovarPedido(id) {
    try {
      const r = await apiFetch(`/pedidos/${id}/contrato`, { method: 'POST' });
      if (r.ok) {
        showToast('Contrato gerado — pedido aprovado!');
        await carregarPedidos();
      } else {
        showToast('Erro ao aprovar pedido.', 'err');
      }
    } catch {
      showToast('Erro ao conectar ao servidor.', 'err');
    }
  }

  async function rejeitarPedido(id) {
    try {
      const r = await apiFetch(`/pedidos/${id}/rejeitar`, { method: 'POST' });
      if (r.ok || r.status === 204) {
        showToast('Pedido rejeitado.', 'err');
        await carregarPedidos();
      } else {
        showToast('Erro ao rejeitar pedido.', 'err');
      }
    } catch {
      showToast('Erro ao conectar ao servidor.', 'err');
    }
  }

  return (
    <section className="sistema-section">
      <div className="sistema-ambient" aria-hidden="true" />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 999,
          background: toast.tipo === 'ok' ? '#14532d' : '#450a0a',
          color: toast.tipo === 'ok' ? '#4ade80' : '#f87171',
          border: `1px solid ${toast.tipo === 'ok' ? '#166534' : '#7f1d1d'}`,
          padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="section-container">
        <motion.div className="section-header"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Análise de Pedidos</span>
          <h2 className="section-title">Pedidos <span className="accent-text">Pendentes</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
            Revise CPF, renda informada e aprove ou rejeite cada solicitação
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>Fila de Análise</h3>
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
                <button className="btn-secondary-hero" style={{ fontSize: 13, marginTop: 12 }} onClick={carregarPedidos}>Tentar novamente</button>
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
                    <th className="sis-th sis-hidden-sm">CPF</th>
                    <th className="sis-th sis-hidden-sm">Renda</th>
                    <th className="sis-th sis-hidden-md">Período</th>
                    <th className="sis-th">Valor</th>
                    <th className="sis-th">Situação</th>
                    <th className="sis-th">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => {
                    const rendaSuficiente = p.rendaInformada != null && p.valorTotal != null
                      ? p.rendaInformada >= p.valorTotal * 3
                      : null;
                    return (
                      <tr key={p.id} className="sis-row">
                        <td className="sis-td sis-td--id">{p.id}</td>
                        <td className="sis-td">Cliente #{p.clienteId}</td>
                        <td className="sis-td sis-hidden-sm" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {p.cpfInformado || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td className="sis-td sis-hidden-sm">
                          {p.rendaInformada != null
                            ? <span style={{ color: rendaSuficiente === true ? '#4ade80' : rendaSuficiente === false ? '#f87171' : 'inherit' }}>
                                {fmtMoeda(p.rendaInformada)}
                              </span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                          }
                        </td>
                        <td className="sis-td sis-hidden-md" style={{ fontSize: 12 }}>
                          {fmtData(p.dataInicio)} → {fmtData(p.dataFim)}
                        </td>
                        <td className="sis-td">{p.valorTotal != null ? fmtMoeda(p.valorTotal) : '—'}</td>
                        <td className="sis-td">
                          {rendaSuficiente === true && <span style={{ fontSize: 11, color: '#4ade80' }}>✓ Renda ok</span>}
                          {rendaSuficiente === false && <span style={{ fontSize: 11, color: '#f87171' }}>✗ Renda baixa</span>}
                          {rendaSuficiente === null && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sem dados</span>}
                        </td>
                        <td className="sis-td sis-td--actions">
                          <button
                            className="sis-btn-edit"
                            onClick={() => setPedidoDetalhe(p)}
                            title="Ver detalhes e decidir"
                            style={{ fontSize: 11, padding: '3px 9px', whiteSpace: 'nowrap' }}
                          >
                            Analisar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>

      {pedidoDetalhe && (
        <DetalheModal
          pedido={pedidoDetalhe}
          onAprovar={aprovarPedido}
          onRejeitar={rejeitarPedido}
          onClose={() => setPedidoDetalhe(null)}
        />
      )}
    </section>
  );
}
