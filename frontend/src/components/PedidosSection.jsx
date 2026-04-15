import { useState, useMemo, useCallback, useRef, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePedidos } from '../hooks/usePedidos';
import { useAuth } from '../context/AuthContext';

function fmtMoeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(d) {
  if (!d) return '—';
  const [y, m, dia] = d.split('-');
  return `${dia}/${m}/${y}`;
}

const STATUS_CORES = {
  PENDENTE:  { bg: '#78350f', color: '#fcd34d' },
  APROVADO:  { bg: '#14532d', color: '#4ade80' },
  CANCELADO: { bg: '#450a0a', color: '#f87171' },
  CONCLUIDO: { bg: '#1e3a5f', color: '#60a5fa' },
};

function StatusBadge({ status }) {
  const s = STATUS_CORES[status] ?? { bg: '#27272a', color: '#a1a1aa' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
      {status}
    </span>
  );
}

function ApiBadge({ online, loading }) {
  if (loading) return (
    <span className="api-badge api-badge--loading">
      <span className="cm-spinner" style={{ width: 8, height: 8, borderWidth: 1.5 }} />
      Conectando...
    </span>
  );
  return (
    <span className={`api-badge ${online ? 'api-badge--online' : 'api-badge--offline'}`}>
      <span className="api-badge-dot" />
      {online ? 'API online · porta 8082' : 'API offline — inicie o backend'}
    </span>
  );
}

// ── Modal de criação de pedido ────────────────────────────────────────────────
function PedidoModal({ isOpen, onClose, onSave, clientes, automoveis }) {
  const vazio = { clienteId: '', automovelId: '', dataInicio: '', dataFim: '' };
  const [form, setForm] = useState(vazio);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  useMemo(() => {
    if (isOpen) { setForm(vazio); setErro(''); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clienteId || !form.automovelId || !form.dataInicio || !form.dataFim) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.dataFim <= form.dataInicio) {
      setErro('A data de devolução deve ser posterior à data de retirada.');
      return;
    }
    setSaving(true);
    setErro('');
    try {
      await onSave({
        cliente: { id: Number(form.clienteId) },
        automovel: { id: Number(form.automovelId) },
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
      });
      onClose();
    } catch (err) {
      setErro(err.message || 'Erro ao criar pedido.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="cm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="cm-panel"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="cm-neon-top" />
            <div className="cm-header">
              <h2 className="cm-title">Novo Pedido de Aluguel</h2>
              <button className="cm-close" onClick={onClose}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form className="cm-body" onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 12 }}>
                <label className="cm-label">
                  Cliente <span className="cm-required">*</span>
                  <select className="cm-input" value={form.clienteId} onChange={(e) => set('clienteId', e.target.value)}>
                    <option value="">Selecione um cliente…</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome} — {c.cpf}</option>
                    ))}
                  </select>
                </label>
                <label className="cm-label">
                  Automóvel <span className="cm-required">*</span>
                  <select className="cm-input" value={form.automovelId} onChange={(e) => set('automovelId', e.target.value)}>
                    <option value="">Selecione um automóvel…</option>
                    {automoveis.filter((a) => a.disponivel).map((a) => (
                      <option key={a.id} value={a.id}>{a.marca} {a.modelo} ({a.placa}) — {fmtMoeda(a.valorDiaria)}/dia</option>
                    ))}
                  </select>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label className="cm-label">
                    Data de retirada <span className="cm-required">*</span>
                    <input className="cm-input" type="date" value={form.dataInicio} onChange={(e) => set('dataInicio', e.target.value)} />
                  </label>
                  <label className="cm-label">
                    Data de devolução <span className="cm-required">*</span>
                    <input className="cm-input" type="date" value={form.dataFim} onChange={(e) => set('dataFim', e.target.value)} />
                  </label>
                </div>
              </div>
              {erro && <p className="cm-error">{erro}</p>}
              <div className="cm-footer">
                <button type="button" className="btn-secondary-hero" onClick={onClose} disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary-hero" disabled={saving}>
                  {saving ? <span className="cm-spinner" /> : 'Criar Pedido'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Modal de confirmação de cancelamento ──────────────────────────────────────
function ConfirmModal({ pedido, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  return (
    <AnimatePresence>
      {pedido && (
        <>
          <motion.div className="cm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
          <motion.div className="cm-panel" style={{ maxWidth: 420 }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="cm-neon-top" style={{ background: 'linear-gradient(90deg,transparent,#ff4444,transparent)' }} />
            <div className="cm-header">
              <h2 className="cm-title" style={{ color: '#ff6b6b' }}>Cancelar Pedido</h2>
              <button className="cm-close" onClick={onCancel}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="cm-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Tem certeza que deseja cancelar o pedido <strong style={{ color: '#fff' }}>#{pedido.id}</strong>?
              </p>
            </div>
            <div className="cm-footer">
              <button className="btn-secondary-hero" onClick={onCancel} disabled={loading}>Voltar</button>
              <button
                className="btn-primary-hero"
                style={{ background: '#dc2626', boxShadow: '0 0 20px rgba(220,38,38,0.3)' }}
                disabled={loading}
                onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}
              >
                {loading ? <span className="cm-spinner" /> : 'Cancelar Pedido'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Linha da tabela ───────────────────────────────────────────────────────────
const PedidoRow = memo(function PedidoRow({ pedido, onCancelar, onGerarContrato, index }) {
  const podeGerar = pedido.status === 'PENDENTE';
  const podeCancelar = pedido.status === 'PENDENTE';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="sis-row"
    >
      <td className="sis-td sis-td--id">{pedido.id}</td>
      <td className="sis-td">{pedido.cliente?.nome ?? pedido.cliente?.id ?? '—'}</td>
      <td className="sis-td sis-hidden-md">
        {pedido.automovel ? `${pedido.automovel.marca} ${pedido.automovel.modelo}` : '—'}
      </td>
      <td className="sis-td sis-hidden-sm">{fmtData(pedido.dataInicio)}</td>
      <td className="sis-td sis-hidden-sm">{fmtData(pedido.dataFim)}</td>
      <td className="sis-td">{pedido.valorTotal != null ? fmtMoeda(pedido.valorTotal) : '—'}</td>
      <td className="sis-td"><StatusBadge status={pedido.status} /></td>
      <td className="sis-td sis-td--actions">
        {podeGerar && (
          <button className="sis-btn-edit" onClick={() => onGerarContrato(pedido)} title="Gerar Contrato"
            style={{ fontSize: 10, padding: '3px 7px', whiteSpace: 'nowrap' }}>
            Contrato
          </button>
        )}
        {podeCancelar && (
          <button className="sis-btn-del" onClick={() => onCancelar(pedido)} title="Cancelar">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </td>
    </motion.tr>
  );
});

// ── Seção principal ───────────────────────────────────────────────────────────
export default function PedidosSection() {
  const { token } = useAuth();
  const { pedidos, loading, error, online, carregar, criar, cancelar, gerarContrato } = usePedidos(token);
  const [modalAberto, setModalAberto] = useState(false);
  const [pedidoCancelando, setPedidoCancelando] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Carrega clientes e automóveis para os selects do modal
  const [clientes, setClientes] = useState([]);
  const [automoveis, setAutomoveis] = useState([]);
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
    fetch('/clientes', { headers }).then((r) => r.ok ? r.json() : []).then(setClientes).catch(() => {});
    fetch('/automoveis', { headers }).then((r) => r.ok ? r.json() : []).then(setAutomoveis).catch(() => {});
  }, [token]);

  const showToast = useCallback((msg, tipo = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, tipo });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const pendentes = useMemo(() => pedidos.filter((p) => p.status === 'PENDENTE').length, [pedidos]);
  const aprovados = useMemo(() => pedidos.filter((p) => p.status === 'APROVADO').length, [pedidos]);

  const handleCriar = useCallback(async (payload) => {
    await criar(payload);
    showToast('Pedido criado com sucesso!');
  }, [criar, showToast]);

  const handleCancelar = useCallback(async () => {
    await cancelar(pedidoCancelando.id);
    showToast(`Pedido #${pedidoCancelando.id} cancelado.`, 'danger');
    setPedidoCancelando(null);
  }, [pedidoCancelando, cancelar, showToast]);

  const handleGerarContrato = useCallback(async (pedido) => {
    try {
      await gerarContrato(pedido.id);
      showToast(`Contrato gerado para o pedido #${pedido.id}!`);
    } catch (e) {
      showToast(e.message || 'Erro ao gerar contrato.', 'danger');
    }
  }, [gerarContrato, showToast]);

  return (
    <section className="sistema-section">
      <div className="sistema-ambient" aria-hidden="true" />
      <div className="section-container">

        <motion.div className="section-header"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Gestão de Aluguéis</span>
          <h2 className="section-title">Pedidos <span className="accent-text">de aluguel</span></h2>
          <ApiBadge online={online} loading={loading} />
        </motion.div>

        <div className="sistema-stats">
          {[
            { label: 'Total de pedidos', value: loading ? '—' : pedidos.length },
            { label: 'Pendentes', value: loading ? '—' : pendentes },
            { label: 'Aprovados', value: loading ? '—' : aprovados },
          ].map((s, i) => (
            <motion.div key={s.label} className="sistema-stat-card"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <span className="sistema-stat-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="sistema-stat-value">{s.value}</span>
              <span className="sistema-stat-label">{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="sistema-toolbar">
          <div style={{ flex: 1 }} />
          <div className="sistema-toolbar-right">
            <button className="sis-btn-refresh" onClick={carregar} title="Recarregar">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M11 6.5A4.5 4.5 0 012.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M2 6.5A4.5 4.5 0 0110.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M2 9.5V6.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 3.5V6.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn-primary-hero" style={{ fontSize: 13, padding: '9px 18px' }} onClick={() => setModalAberto(true)}>
              + Novo Pedido
            </button>
          </div>
        </div>

        <div className="sistema-table-wrapper">
          {loading && <div className="sistema-loading"><div className="hero-spinner" /> Carregando pedidos…</div>}

          {!loading && error && !online && (
            <div className="sistema-offline">
              <p>Não foi possível conectar ao backend.</p>
              <button className="btn-secondary-hero" style={{ fontSize: 13, marginTop: 12 }} onClick={carregar}>Tentar novamente</button>
            </div>
          )}

          {!loading && online && (
            <table className="sistema-table">
              <thead>
                <tr>
                  <th className="sis-th">#</th>
                  <th className="sis-th">Cliente</th>
                  <th className="sis-th sis-hidden-md">Automóvel</th>
                  <th className="sis-th sis-hidden-sm">Retirada</th>
                  <th className="sis-th sis-hidden-sm">Devolução</th>
                  <th className="sis-th">Valor</th>
                  <th className="sis-th">Status</th>
                  <th className="sis-th sis-th--actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {pedidos.length === 0 ? (
                    <tr><td colSpan={8} className="sistema-empty">Nenhum pedido cadastrado ainda.</td></tr>
                  ) : (
                    pedidos.map((p, i) => (
                      <PedidoRow key={p.id} pedido={p} index={i}
                        onCancelar={setPedidoCancelando}
                        onGerarContrato={handleGerarContrato}
                      />
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {!loading && online && (
          <p className="sistema-table-foot">
            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} · <span style={{ color: 'var(--text-muted)' }}>API: localhost:8082</span>
          </p>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div className={`sistema-toast sistema-toast--${toast.tipo}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <PedidoModal isOpen={modalAberto} onClose={() => setModalAberto(false)} onSave={handleCriar}
        clientes={clientes} automoveis={automoveis} />
      <ConfirmModal pedido={pedidoCancelando} onConfirm={handleCancelar} onCancel={() => setPedidoCancelando(null)} />
    </section>
  );
}
