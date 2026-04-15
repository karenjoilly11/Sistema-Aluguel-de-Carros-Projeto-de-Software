import { useState, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUsuarios } from '../hooks/useUsuarios';
import { useAuth } from '../context/AuthContext';

const ROLES = ['ADMIN', 'CLIENTE', 'OPERADOR'];

const ROLE_CORES = {
  ADMIN:    { bg: 'rgba(43,76,255,0.15)',  color: '#6b8aff', border: 'rgba(43,76,255,0.3)'  },
  CLIENTE:  { bg: 'rgba(34,197,94,0.1)',   color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  OPERADOR: { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)'},
};

function RoleBadge({ role }) {
  const s = ROLE_CORES[role] ?? { bg: '#27272a', color: '#a1a1aa', border: '#333' };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '2px 9px', borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: 0.4 }}>
      {role}
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

// ── Modal de criação/edição ───────────────────────────────────────────────────
function UsuarioModal({ isOpen, onClose, onSave, usuarioParaEditar }) {
  const vazio = { nome: '', email: '', senha: '', role: 'CLIENTE' };
  const [form, setForm] = useState(vazio);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  useMemo(() => {
    if (isOpen) { setForm(usuarioParaEditar ? { ...usuarioParaEditar, senha: '' } : vazio); setErro(''); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, usuarioParaEditar]);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.email) { setErro('Nome e email são obrigatórios.'); return; }
    if (!usuarioParaEditar && !form.senha) { setErro('Senha é obrigatória para novo usuário.'); return; }
    setSaving(true); setErro('');
    try {
      const payload = { nome: form.nome, email: form.email, role: form.role };
      if (form.senha) payload.senha = form.senha;
      await onSave(payload);
      onClose();
    } catch (err) {
      setErro(err.message || 'Erro ao salvar usuário.');
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
              <h2 className="cm-title">{usuarioParaEditar ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button className="cm-close" onClick={onClose}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form className="cm-body" onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 12 }}>
                <label className="cm-label">
                  Nome <span className="cm-required">*</span>
                  <input className="cm-input" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Nome completo" />
                </label>
                <label className="cm-label">
                  Email <span className="cm-required">*</span>
                  <input className="cm-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@exemplo.com" />
                </label>
                <label className="cm-label">
                  Senha {!usuarioParaEditar && <span className="cm-required">*</span>}
                  <input className="cm-input" type="password" value={form.senha} onChange={(e) => set('senha', e.target.value)}
                    placeholder={usuarioParaEditar ? 'Deixe em branco para não alterar' : 'Mínimo 6 caracteres'} />
                </label>
                <label className="cm-label">
                  Perfil <span className="cm-required">*</span>
                  <select className="cm-input" value={form.role} onChange={(e) => set('role', e.target.value)}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
              </div>
              {erro && <p className="cm-error" style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{erro}</p>}
              <div className="cm-footer">
                <button type="button" className="btn-secondary-hero" onClick={onClose} disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary-hero" disabled={saving}>
                  {saving ? <span className="cm-spinner" /> : (usuarioParaEditar ? 'Salvar' : 'Criar Usuário')}
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
              <h2 className="cm-title" style={{ color: '#ff6b6b' }}>Excluir Usuário</h2>
              <button className="cm-close" onClick={onCancel}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="cm-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Tem certeza que deseja excluir o usuário <strong style={{ color: '#fff' }}>{item.nome}</strong> ({item.email})?
                <br />Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="cm-footer">
              <button className="btn-secondary-hero" onClick={onCancel} disabled={deleting}>Cancelar</button>
              <button className="btn-primary-hero"
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
const UsuarioRow = memo(function UsuarioRow({ usuario, onEditar, onExcluir, index, currentEmail }) {
  const ehEuMesmo = usuario.email === currentEmail;
  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="sis-row"
    >
      <td className="sis-td sis-td--id">{usuario.id}</td>
      <td className="sis-td sis-td--nome">
        {usuario.nome}
        {ehEuMesmo && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--blue)', background: 'var(--blue-dim)', padding: '1px 6px', borderRadius: 4 }}>você</span>}
      </td>
      <td className="sis-td sis-td--mono">{usuario.email}</td>
      <td className="sis-td"><RoleBadge role={usuario.role} /></td>
      <td className="sis-td sis-td--actions">
        <button className="sis-btn-edit" onClick={() => onEditar(usuario)} title="Editar">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M9 2l2 2L4 11H2V9L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="sis-btn-del" onClick={() => onExcluir(usuario)} title="Excluir" disabled={ehEuMesmo}
          style={ehEuMesmo ? { opacity: 0.3, cursor: 'not-allowed' } : {}}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 4h9M5 4V2.5h3V4M4.5 4l.5 7h3l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </td>
    </motion.tr>
  );
});

// ── Seção principal ───────────────────────────────────────────────────────────
export default function UsuariosSection() {
  const { token, user } = useAuth();
  const { usuarios, loading, error, online, carregar, criar, atualizar, excluir } = useUsuarios(token);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioExcluindo, setUsuarioExcluindo] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg, tipo = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, tipo });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const q = search.toLowerCase();
    return usuarios.filter((u) => u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q));
  }, [usuarios, search]);

  const contagemPorRole = useMemo(() => {
    return ROLES.reduce((acc, r) => ({ ...acc, [r]: usuarios.filter((u) => u.role === r).length }), {});
  }, [usuarios]);

  const abrirNovo    = useCallback(() => { setUsuarioEditando(null); setModalAberto(true); }, []);
  const abrirEditar  = useCallback((u) => { setUsuarioEditando(u); setModalAberto(true); }, []);

  const handleSave = useCallback(async (payload) => {
    if (usuarioEditando) {
      await atualizar(usuarioEditando.id, payload);
      showToast('Usuário atualizado com sucesso!');
    } else {
      await criar(payload);
      showToast('Usuário criado com sucesso!');
    }
  }, [usuarioEditando, atualizar, criar, showToast]);

  const handleExcluir = useCallback(async () => {
    await excluir(usuarioExcluindo.id);
    showToast(`${usuarioExcluindo.nome} removido.`, 'danger');
    setUsuarioExcluindo(null);
  }, [usuarioExcluindo, excluir, showToast]);

  return (
    <section className="sistema-section">
      <div className="sistema-ambient" aria-hidden="true" />
      <div className="section-container">

        <motion.div className="section-header"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <span className="section-tag">Controle de Acesso</span>
          <h2 className="section-title">Usuários <span className="accent-text">do sistema</span></h2>
          <ApiBadge online={online} loading={loading} />
        </motion.div>

        {/* Stats por role */}
        <div className="sistema-stats">
          {[
            { label: 'Total de usuários', value: loading ? '—' : usuarios.length },
            { label: 'Administradores',   value: loading ? '—' : (contagemPorRole.ADMIN ?? 0) },
            { label: 'Clientes',          value: loading ? '—' : (contagemPorRole.CLIENTE ?? 0) },
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

        {/* Toolbar */}
        <div className="sistema-toolbar">
          <div className="sistema-search-wrapper">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="sistema-search-icon">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input className="sistema-search" placeholder="Buscar por nome, email ou perfil…"
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
            <button className="btn-primary-hero" style={{ fontSize: 13, padding: '9px 18px' }} onClick={abrirNovo}>
              + Novo Usuário
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="sistema-table-wrapper">
          {loading && <div className="sistema-loading"><div className="hero-spinner" /> Carregando usuários…</div>}
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
                  <th className="sis-th">Nome</th>
                  <th className="sis-th">Email</th>
                  <th className="sis-th">Perfil</th>
                  <th className="sis-th sis-th--actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {usuariosFiltrados.length === 0 ? (
                    <tr><td colSpan={5} className="sistema-empty">
                      {search ? 'Nenhum resultado para a busca.' : 'Nenhum usuário encontrado.'}
                    </td></tr>
                  ) : (
                    usuariosFiltrados.map((u, i) => (
                      <UsuarioRow key={u.id} usuario={u} index={i}
                        currentEmail={user?.email}
                        onEditar={abrirEditar}
                        onExcluir={setUsuarioExcluindo}
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
            {usuariosFiltrados.length} de {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} ·{' '}
            <span style={{ color: 'var(--text-muted)' }}>API: localhost:8082</span>
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

      <UsuarioModal isOpen={modalAberto} onClose={() => setModalAberto(false)} onSave={handleSave} usuarioParaEditar={usuarioEditando} />
      <ConfirmModal item={usuarioExcluindo} onConfirm={handleExcluir} onCancel={() => setUsuarioExcluindo(null)} />
    </section>
  );
}
