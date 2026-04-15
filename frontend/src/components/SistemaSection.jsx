import { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientes } from '../hooks/useClientes';
import { useAuth } from '../context/AuthContext';
import ClienteModal from './ClienteModal';

// ── Formata CPF para exibição ─────────────────────────────────────────────────
function fmtCpf(cpf = '') {
  const d = cpf.replace(/\D/g, '');
  return d.length === 11
    ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
    : cpf;
}

function fmtMoeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── Badge de status da API ────────────────────────────────────────────────────
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

// ── Linha da tabela ───────────────────────────────────────────────────────────
const ClienteRow = memo(function ClienteRow({ cliente, onEditar, onExcluir, index }) {
  const totalRend = useMemo(
    () => (cliente.rendimentos ?? []).reduce((s, r) => s + Number(r.valor ?? 0), 0),
    [cliente.rendimentos],
  );

  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="sis-row"
    >
      <td className="sis-td sis-td--id">{cliente.id}</td>
      <td className="sis-td sis-td--nome">{cliente.nome}</td>
      <td className="sis-td sis-td--mono">{fmtCpf(cliente.cpf)}</td>
      <td className="sis-td sis-td--mono sis-hidden-md">{cliente.rg}</td>
      <td className="sis-td sis-hidden-sm">{cliente.profissao || <span className="sis-empty">—</span>}</td>
      <td className="sis-td">
        {(cliente.rendimentos ?? []).length > 0 ? (
          <span className="sis-rend-badge">
            {(cliente.rendimentos ?? []).length} fonte{(cliente.rendimentos ?? []).length > 1 ? 's' : ''} · {fmtMoeda(totalRend)}
          </span>
        ) : (
          <span className="sis-empty">Sem rendimento</span>
        )}
      </td>
      <td className="sis-td sis-td--actions">
        <button className="sis-btn-edit" onClick={() => onEditar(cliente)} title="Editar">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M9 2l2 2L4 11H2V9L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="sis-btn-del" onClick={() => onExcluir(cliente)} title="Excluir">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 4h9M5 4V2.5h3V4M4.5 4l.5 7h3l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </td>
    </motion.tr>
  );
});

// ── Modal de confirmação de exclusão ─────────────────────────────────────────
function ConfirmModal({ cliente, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <AnimatePresence>
      {cliente && (
        <>
          <motion.div className="cm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
          <motion.div className="cm-panel" style={{ maxWidth: 420 }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="cm-neon-top" style={{ background: 'linear-gradient(90deg,transparent,#ff4444,transparent)' }} />
            <div className="cm-header">
              <h2 className="cm-title" style={{ color: '#ff6b6b' }}>Confirmar Exclusão</h2>
              <button className="cm-close" onClick={onCancel}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="cm-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Tem certeza que deseja excluir o cliente <strong style={{ color: '#fff' }}>{cliente.nome}</strong>?
                <br/>Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="cm-footer">
              <button className="btn-secondary-hero" onClick={onCancel} disabled={deleting}>Cancelar</button>
              <button
                className="btn-primary-hero"
                style={{ background: '#dc2626', boxShadow: '0 0 20px rgba(220,38,38,0.3)' }}
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  await onConfirm();
                  setDeleting(false);
                }}
              >
                {deleting ? <span className="cm-spinner" /> : 'Excluir'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Seção principal ───────────────────────────────────────────────────────────
export default function SistemaSection() {
  const { token } = useAuth();
  const { clientes, loading, error, online, carregar, cadastrar, atualizar, excluir } = useClientes(token);
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteExcluindo, setClienteExcluindo] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Debounce de 250ms no campo de busca
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = useCallback((msg, tipo = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, tipo });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Limpa timer ao desmontar
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const clientesFiltrados = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return clientes.filter(
      (c) => c.nome?.toLowerCase().includes(q) || c.cpf?.includes(q) || c.rg?.toLowerCase().includes(q),
    );
  }, [clientes, debouncedSearch]);

  const totalRendimentos = useMemo(
    () => clientes.reduce((s, c) => s + (c.rendimentos ?? []).reduce((rs, r) => rs + Number(r.valor ?? 0), 0), 0),
    [clientes],
  );

  const abrirNovo = useCallback(() => {
    setClienteEditando(null);
    setModalAberto(true);
  }, []);

  const abrirEditar = useCallback((cliente) => {
    setClienteEditando(cliente);
    setModalAberto(true);
  }, []);

  const handleSave = useCallback(async (payload) => {
    if (clienteEditando) {
      await atualizar(clienteEditando.id, payload);
      showToast('Cliente atualizado com sucesso!');
    } else {
      await cadastrar(payload);
      showToast('Cliente cadastrado com sucesso!');
    }
  }, [clienteEditando, atualizar, cadastrar, showToast]);

  const handleExcluir = useCallback(async () => {
    await excluir(clienteExcluindo.id);
    showToast(`${clienteExcluindo.nome} removido.`, 'danger');
    setClienteExcluindo(null);
  }, [clienteExcluindo, excluir, showToast]);

  return (
    <section className="sistema-section" id="sistema">
      <div className="sistema-ambient" aria-hidden="true" />

      <div className="section-container">
        {/* Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Gestão de Clientes</span>
          <h2 className="section-title">
            Sistema <span className="accent-text">integrado</span> ao backend
          </h2>
          <ApiBadge online={online} loading={loading} />
        </motion.div>

        {/* Stats cards */}
        <div className="sistema-stats">
          {[
            { label: 'Clientes cadastrados', value: loading ? '—' : clientes.length },
            { label: 'Total de rendimentos', value: loading ? '—' : (clientes.reduce((s,c) => s + (c.rendimentos?.length ?? 0), 0)) },
            { label: 'Renda total na base', value: loading ? '—' : fmtMoeda(totalRendimentos) },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="sistema-stat-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <span className="sistema-stat-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="sistema-stat-value">{s.value}</span>
              <span className="sistema-stat-label">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Aviso módulo de aluguel pendente */}
        <motion.div
          className="sistema-pending-notice"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l7 13H1L8 1z" stroke="#f59e0b" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M8 6v4M8 11.5v.5" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <div>
            <strong>Módulo de Aluguel em desenvolvimento</strong>
            <p>
              O backend atual gerencia cadastro e perfil financeiro de clientes.
              As entidades <code>Carro</code>, <code>Contrato</code> e <code>Reserva</code> ainda não existem no sistema —
              serão implementadas nas próximas sprints.
            </p>
          </div>
        </motion.div>

        {/* Barra de ações */}
        <div className="sistema-toolbar">
          <div className="sistema-search-wrapper">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="sistema-search-icon">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              className="sistema-search"
              placeholder="Buscar por nome, CPF ou RG…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sistema-toolbar-right">
            <button className="sis-btn-refresh" onClick={carregar} title="Recarregar">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M11 6.5A4.5 4.5 0 012.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M2 6.5A4.5 4.5 0 0110.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M2 9.5V6.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 3.5V6.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn-primary-hero" style={{ fontSize: 13, padding: '9px 18px' }} onClick={abrirNovo}>
              + Novo Cliente
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="sistema-table-wrapper">
          {loading && (
            <div className="sistema-loading">
              <div className="hero-spinner" /> Carregando clientes…
            </div>
          )}

          {!loading && error && !online && (
            <div className="sistema-offline">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="13" stroke="#71717A" strokeWidth="1.5"/>
                <path d="M16 10v7M16 20.5v1" stroke="#71717A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>Não foi possível conectar ao backend.</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Certifique-se de que o Micronaut está rodando na porta 8082.</p>
              <button className="btn-secondary-hero" style={{ fontSize: 13, marginTop: 12 }} onClick={carregar}>
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && online && (
            <table className="sistema-table">
              <thead>
                <tr>
                  <th className="sis-th">#</th>
                  <th className="sis-th">Nome</th>
                  <th className="sis-th">CPF</th>
                  <th className="sis-th sis-hidden-md">RG</th>
                  <th className="sis-th sis-hidden-sm">Profissão</th>
                  <th className="sis-th">Rendimentos</th>
                  <th className="sis-th sis-th--actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {clientesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="sistema-empty">
                        {search ? 'Nenhum resultado para a busca.' : 'Nenhum cliente cadastrado ainda.'}
                      </td>
                    </tr>
                  ) : (
                    clientesFiltrados.map((c, i) => (
                      <ClienteRow
                        key={c.id}
                        cliente={c}
                        index={i}
                        onEditar={abrirEditar}
                        onExcluir={setClienteExcluindo}
                      />
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Rodapé da tabela */}
        {!loading && online && (
          <p className="sistema-table-foot">
            {clientesFiltrados.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} ·{' '}
            <a href="#sistema" className="sistema-link">
              API: localhost:8082
            </a>
          </p>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`sistema-toast sistema-toast--${toast.tipo}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ClienteModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSave}
        clienteParaEditar={clienteEditando}
      />
      <ConfirmModal
        cliente={clienteExcluindo}
        onConfirm={handleExcluir}
        onCancel={() => setClienteExcluindo(null)}
      />
    </section>
  );
}
