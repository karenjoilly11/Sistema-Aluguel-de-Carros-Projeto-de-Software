import { useState, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutomoveis } from '../hooks/useAutomoveis';
import { useAuth } from '../context/AuthContext';
import CriarPedidoModal from './CriarPedidoModal';

function fmtMoeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

// ── Modal de Automóvel ────────────────────────────────────────────────────────
function AutomovelModal({ isOpen, onClose, onSave, automovelParaEditar }) {
  const vazio = { placa: '', marca: '', modelo: '', cor: '', ano: '', valorDiaria: '', disponivel: true, urlFoto: '' };
  const [form, setForm] = useState(vazio);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  useMemo(() => {
    if (isOpen) setForm(automovelParaEditar ? { ...automovelParaEditar } : vazio);
    setErro('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, automovelParaEditar]);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.placa || !form.marca || !form.modelo || !form.valorDiaria) {
      setErro('Preencha os campos obrigatórios: placa, marca, modelo e valor/dia.');
      return;
    }
    setSaving(true);
    setErro('');
    try {
      await onSave({ ...form, ano: Number(form.ano), valorDiaria: Number(form.valorDiaria) });
      onClose();
    } catch (err) {
      setErro(err.message || 'Erro ao salvar automóvel.');
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
              <h2 className="cm-title">{automovelParaEditar ? 'Editar Automóvel' : 'Novo Automóvel'}</h2>
              <button className="cm-close" onClick={onClose}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form className="cm-body" onSubmit={handleSubmit}>
              <div className="cm-field-grid" style={{ display: 'grid', gap: 12 }}>
                <label className="cm-label">
                  Placa <span className="cm-required">*</span>
                  <input className="cm-input" value={form.placa} onChange={(e) => set('placa', e.target.value.toUpperCase())}
                    placeholder="ABC-1234" disabled={!!automovelParaEditar} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label className="cm-label">
                    Marca <span className="cm-required">*</span>
                    <input className="cm-input" value={form.marca} onChange={(e) => set('marca', e.target.value)} placeholder="Ex: Lamborghini" />
                  </label>
                  <label className="cm-label">
                    Modelo <span className="cm-required">*</span>
                    <input className="cm-input" value={form.modelo} onChange={(e) => set('modelo', e.target.value)} placeholder="Ex: Huracán" />
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label className="cm-label">
                    Cor
                    <input className="cm-input" value={form.cor} onChange={(e) => set('cor', e.target.value)} placeholder="Ex: Verde" />
                  </label>
                  <label className="cm-label">
                    Ano
                    <input className="cm-input" type="number" min="1900" max="2030" value={form.ano} onChange={(e) => set('ano', e.target.value)} placeholder="2024" />
                  </label>
                </div>
                <label className="cm-label">
                  Valor por diária (R$) <span className="cm-required">*</span>
                  <input className="cm-input" type="number" min="0" step="0.01" value={form.valorDiaria} onChange={(e) => set('valorDiaria', e.target.value)} placeholder="1500.00" />
                </label>
                <label className="cm-label">
                  URL da foto
                  <input className="cm-input" value={form.urlFoto} onChange={(e) => set('urlFoto', e.target.value)} placeholder="https://exemplo.com/foto.jpg" />
                </label>
                {form.urlFoto && (
                  <div style={{ borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', textAlign: 'center', maxHeight: 160 }}>
                    <img
                      src={form.urlFoto}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                      onLoad={(e) => { e.target.style.display = 'block'; }}
                    />
                  </div>
                )}
                <label className="cm-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" checked={form.disponivel} onChange={(e) => set('disponivel', e.target.checked)} />
                  Disponível para aluguel
                </label>
              </div>
              {erro && <p className="cm-error">{erro}</p>}
              <div className="cm-footer">
                <button type="button" className="btn-secondary-hero" onClick={onClose} disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary-hero" disabled={saving}>
                  {saving ? <span className="cm-spinner" /> : (automovelParaEditar ? 'Salvar alterações' : 'Cadastrar')}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Modal de confirmação de exclusão ─────────────────────────────────────────
function ConfirmModal({ item, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <AnimatePresence>
      {item && (
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
                Tem certeza que deseja excluir o automóvel <strong style={{ color: '#fff' }}>{item.marca} {item.modelo}</strong> ({item.placa})?
                <br/>Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="cm-footer">
              <button className="btn-secondary-hero" onClick={onCancel} disabled={deleting}>Cancelar</button>
              <button
                className="btn-primary-hero"
                style={{ background: '#dc2626', boxShadow: '0 0 20px rgba(220,38,38,0.3)' }}
                disabled={deleting}
                onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false); }}
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

// ── Linha da tabela ───────────────────────────────────────────────────────────
const AutomovelRow = memo(function AutomovelRow({ auto, onEditar, onExcluir, onAlugar, index, somenteLeitura }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="sis-row"
    >
      <td className="sis-td sis-td--id">{auto.id}</td>
      <td className="sis-td sis-hidden-md" style={{ padding: '4px 8px' }}>
        {auto.urlFoto ? (
          <img src={auto.urlFoto} alt={`${auto.marca} ${auto.modelo}`}
            style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 6, display: 'block' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="sis-empty">—</span>
        )}
      </td>
      <td className="sis-td sis-td--mono">{auto.placa}</td>
      <td className="sis-td">{auto.marca}</td>
      <td className="sis-td">{auto.modelo}</td>
      <td className="sis-td sis-hidden-md">{auto.cor || <span className="sis-empty">—</span>}</td>
      <td className="sis-td sis-hidden-md">{auto.ano || <span className="sis-empty">—</span>}</td>
      <td className="sis-td">{auto.valorDiaria != null ? fmtMoeda(auto.valorDiaria) : <span className="sis-empty">—</span>}</td>
      <td className="sis-td">
        <span style={{ color: auto.disponivel ? '#4ade80' : '#f87171', fontWeight: 600, fontSize: 12 }}>
          {auto.disponivel ? 'Disponível' : 'Indisponível'}
        </span>
      </td>
      <td className="sis-td sis-td--actions">
        {somenteLeitura ? (
          auto.disponivel && (
            <button
              className="sis-btn-edit"
              onClick={() => onAlugar(auto)}
              title="Solicitar Aluguel"
              style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          )
        ) : (
          <>
            <button className="sis-btn-edit" onClick={() => onEditar(auto)} title="Editar">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M9 2l2 2L4 11H2V9L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="sis-btn-del" onClick={() => onExcluir(auto)} title="Excluir">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 4h9M5 4V2.5h3V4M4.5 4l.5 7h3l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </td>
    </motion.tr>
  );
});

// ── Seção principal ───────────────────────────────────────────────────────────
export default function AutomoveisSection({ somenteLeitura = false }) {
  const { token } = useAuth();
  const { automoveis, loading, error, online, carregar, cadastrar, atualizar, excluir } = useAutomoveis(token);
  const [modalAberto, setModalAberto] = useState(false);
  const [autoEditando, setAutoEditando] = useState(null);
  const [autoExcluindo, setAutoExcluindo] = useState(null);
  const [autoPedindo, setAutoPedindo] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg, tipo = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, tipo });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const autosFiltrados = useMemo(() => {
    const q = search.toLowerCase();
    return automoveis.filter(
      (a) => a.placa?.toLowerCase().includes(q) || a.marca?.toLowerCase().includes(q) || a.modelo?.toLowerCase().includes(q),
    );
  }, [automoveis, search]);

  const disponiveis = useMemo(() => automoveis.filter((a) => a.disponivel).length, [automoveis]);

  const abrirNovo = useCallback(() => { setAutoEditando(null); setModalAberto(true); }, []);
  const abrirEditar = useCallback((auto) => { setAutoEditando(auto); setModalAberto(true); }, []);

  const handleSave = useCallback(async (payload) => {
    if (autoEditando) {
      await atualizar(autoEditando.id, payload);
      showToast('Automóvel atualizado com sucesso!');
    } else {
      await cadastrar(payload);
      showToast('Automóvel cadastrado com sucesso!');
    }
  }, [autoEditando, atualizar, cadastrar, showToast]);

  const handleExcluir = useCallback(async () => {
    await excluir(autoExcluindo.id);
    showToast(`${autoExcluindo.marca} ${autoExcluindo.modelo} removido.`, 'danger');
    setAutoExcluindo(null);
  }, [autoExcluindo, excluir, showToast]);

  return (
    <section className="sistema-section">
      <div className="sistema-ambient" aria-hidden="true" />
      <div className="section-container">

        <motion.div className="section-header"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <span className="section-tag">{somenteLeitura ? 'Frota Disponível' : 'Gestão de Frota'}</span>
          <h2 className="section-title">Automóveis <span className="accent-text">disponíveis</span></h2>
          <ApiBadge online={online} loading={loading} />
        </motion.div>

        <div className="sistema-stats">
          {[
            { label: 'Veículos cadastrados', value: loading ? '—' : automoveis.length },
            { label: 'Disponíveis', value: loading ? '—' : disponiveis },
            { label: 'Indisponíveis', value: loading ? '—' : automoveis.length - disponiveis },
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
          <div className="sistema-search-wrapper">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="sistema-search-icon">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input className="sistema-search" placeholder="Buscar por placa, marca ou modelo…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
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
            {!somenteLeitura && (
              <button className="btn-primary-hero" style={{ fontSize: 13, padding: '9px 18px' }} onClick={abrirNovo}>
                + Novo Automóvel
              </button>
            )}
          </div>
        </div>

        <div className="sistema-table-wrapper">
          {loading && <div className="sistema-loading"><div className="hero-spinner" /> Carregando frota…</div>}

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
                  <th className="sis-th sis-hidden-md">Foto</th>
                  <th className="sis-th">Placa</th>
                  <th className="sis-th">Marca</th>
                  <th className="sis-th">Modelo</th>
                  <th className="sis-th sis-hidden-md">Cor</th>
                  <th className="sis-th sis-hidden-md">Ano</th>
                  <th className="sis-th">Diária</th>
                  <th className="sis-th">Status</th>
                  {!somenteLeitura && <th className="sis-th sis-th--actions">Ações</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {autosFiltrados.length === 0 ? (
                    <tr><td colSpan={somenteLeitura ? 9 : 10} className="sistema-empty">
                      {search ? 'Nenhum resultado para a busca.' : 'Nenhum automóvel cadastrado ainda.'}
                    </td></tr>
                  ) : (
                    autosFiltrados.map((a, i) => (
                      <AutomovelRow
                        key={a.id}
                        auto={a}
                        index={i}
                        onEditar={abrirEditar}
                        onExcluir={setAutoExcluindo}
                        onAlugar={setAutoPedindo}
                        somenteLeitura={somenteLeitura}
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
            {autosFiltrados.length} de {automoveis.length} veículo{automoveis.length !== 1 ? 's' : ''} · <span style={{ color: 'var(--text-muted)' }}>API: localhost:8082</span>
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

      {!somenteLeitura && (
        <>
          <AutomovelModal isOpen={modalAberto} onClose={() => setModalAberto(false)} onSave={handleSave} automovelParaEditar={autoEditando} />
          <ConfirmModal item={autoExcluindo} onConfirm={handleExcluir} onCancel={() => setAutoExcluindo(null)} />
        </>
      )}

      <CriarPedidoModal
        isOpen={!!autoPedindo}
        onClose={() => setAutoPedindo(null)}
        automovel={autoPedindo}
        onSuccess={() => {
          carregar();
          showToast('Pedido criado com sucesso! Aguarde análise.');
        }}
      />
    </section>
  );
}
