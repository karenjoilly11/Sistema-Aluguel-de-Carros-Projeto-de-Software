import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VINCULOS = ['CLT', 'PJ', 'Autônomo', 'Servidor', 'Outro'];

const rendimentoVazio = () => ({
  _id: crypto.randomUUID(),
  valor: '',
  tipoVinculo: 'CLT',
  nomeEntidadeEmpregadora: '',
  cnpjEntidadeEmpregadora: '',
});

function mascaraCPF(v) {
  return v.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

// ── Campo de formulário reutilizável ─────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="cm-field">
      <label className="cm-label">
        {label}
        {required && <span className="cm-required">*</span>}
      </label>
      {children}
      {error && <span className="cm-field-error">{error}</span>}
    </div>
  );
}

// ── Card de rendimento ────────────────────────────────────────────────────────
function RendimentoCard({ rend, onChange, onRemove, errors }) {
  return (
    <motion.div
      className="cm-rend-card"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="cm-rend-header">
        <span className="cm-rend-label">Rendimento</span>
        <button type="button" className="cm-rend-remove" onClick={onRemove} aria-label="Remover">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="cm-rend-grid">
        <Field label="Valor mensal (R$)" required error={errors?.valor}>
          <input
            className={`cm-input${errors?.valor ? ' cm-input--error' : ''}`}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={rend.valor}
            onChange={(e) => onChange({ ...rend, valor: e.target.value })}
          />
        </Field>

        <Field label="Tipo de vínculo">
          <select
            className="cm-input cm-select"
            value={rend.tipoVinculo}
            onChange={(e) => onChange({ ...rend, tipoVinculo: e.target.value })}
          >
            {VINCULOS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>

        <Field label="Entidade empregadora" required error={errors?.nomeEntidadeEmpregadora}>
          <input
            className={`cm-input${errors?.nomeEntidadeEmpregadora ? ' cm-input--error' : ''}`}
            type="text"
            placeholder="Nome da empresa"
            value={rend.nomeEntidadeEmpregadora}
            onChange={(e) => onChange({ ...rend, nomeEntidadeEmpregadora: e.target.value })}
          />
        </Field>

        <Field label="CNPJ">
          <input
            className="cm-input"
            type="text"
            placeholder="00.000.000/0000-00"
            value={rend.cnpjEntidadeEmpregadora}
            onChange={(e) => onChange({ ...rend, cnpjEntidadeEmpregadora: e.target.value })}
          />
        </Field>
      </div>
    </motion.div>
  );
}

// ── Modal principal ───────────────────────────────────────────────────────────
export default function ClienteModal({ isOpen, onClose, onSave, clienteParaEditar = null }) {
  const editando = Boolean(clienteParaEditar);

  const [form, setForm] = useState({
    nome: '', cpf: '', rg: '', endereco: '', profissao: '',
  });
  const [rendimentos, setRendimentos] = useState([rendimentoVazio()]);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');

  // Preenche formulário ao editar
  useEffect(() => {
    if (isOpen && clienteParaEditar) {
      const { nome, cpf, rg, endereco, profissao, rendimentos: rends = [] } = clienteParaEditar;
      setForm({ nome, cpf, rg, endereco, profissao: profissao ?? '' });
      setRendimentos(rends.length > 0
        ? rends.map((r) => ({ ...r, _id: crypto.randomUUID() }))
        : [rendimentoVazio()],
      );
    } else if (isOpen) {
      setForm({ nome: '', cpf: '', rg: '', endereco: '', profissao: '' });
      setRendimentos([rendimentoVazio()]);
    }
    setErrors({});
    setApiError('');
  }, [isOpen, clienteParaEditar]);

  // Fecha com ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const setField = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);

  // Validação local
  function validate() {
    const e = {};
    if (!form.nome.trim())     e.nome     = 'Nome é obrigatório';
    if (!form.cpf.trim())      e.cpf      = 'CPF é obrigatório';
    if (!form.rg.trim())       e.rg       = 'RG é obrigatório';
    if (!form.endereco.trim()) e.endereco = 'Endereço é obrigatório';

    const rendErrors = rendimentos.map((r) => {
      const re = {};
      if (!r.valor || Number(r.valor) <= 0) re.valor = 'Valor inválido';
      if (!r.nomeEntidadeEmpregadora.trim()) re.nomeEntidadeEmpregadora = 'Obrigatório';
      return Object.keys(re).length ? re : null;
    });
    if (rendErrors.some(Boolean)) e.rendimentos = rendErrors;

    return e;
  }

  async function handleSalvar() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    setApiError('');
    try {
      const payload = {
        ...form,
        cpf: form.cpf.replace(/\D/g, ''),
        rendimentos: rendimentos.map(({ _id, ...r }) => ({
          ...r,
          valor: parseFloat(r.valor),
        })),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setApiError('CPF ou RG já cadastrado no sistema.');
      } else {
        setApiError(err.message || 'Erro ao salvar. Verifique os dados e tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  }

  function addRendimento() {
    if (rendimentos.length >= 3) return;
    setRendimentos((prev) => [...prev, rendimentoVazio()]);
  }

  function updateRendimento(idx, rend) {
    setRendimentos((prev) => prev.map((r, i) => (i === idx ? rend : r)));
  }

  function removeRendimento(idx) {
    setRendimentos((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="cm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Painel */}
          <motion.div
            className="cm-panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cm-title"
          >
            {/* Neon top */}
            <div className="cm-neon-top" />

            {/* Header */}
            <div className="cm-header">
              <div>
                <span className="section-tag" style={{ fontSize: '10px' }}>
                  {editando ? 'Editar cadastro' : 'Novo cadastro'}
                </span>
                <h2 className="cm-title" id="cm-title">
                  {editando ? 'Editar Cliente' : 'Cadastrar Cliente'}
                </h2>
              </div>
              <button className="cm-close" onClick={onClose} aria-label="Fechar">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Body scrollável */}
            <div className="cm-body">
              {/* Erro de API */}
              {apiError && (
                <motion.div
                  className="cm-api-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M7 4.5V7M7 9.5v.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  {apiError}
                </motion.div>
              )}

              {/* Identificação */}
              <p className="cm-section-label">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="4.5" r="2.5" stroke="#2B4CFF" strokeWidth="1.2"/>
                  <path d="M1 12c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#2B4CFF" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Identificação
              </p>
              <div className="cm-grid-2">
                <Field label="Nome completo" required error={errors.nome}>
                  <input
                    className={`cm-input${errors.nome ? ' cm-input--error' : ''}`}
                    placeholder="Ex: João da Silva"
                    value={form.nome}
                    onChange={(e) => setField('nome', e.target.value)}
                  />
                </Field>
                <Field label="Profissão">
                  <input
                    className="cm-input"
                    placeholder="Ex: Engenheiro"
                    value={form.profissao}
                    onChange={(e) => setField('profissao', e.target.value)}
                  />
                </Field>
                <Field label="CPF" required error={errors.cpf}>
                  <input
                    className={`cm-input cm-mono${errors.cpf ? ' cm-input--error' : ''}`}
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    readOnly={editando}
                    onChange={(e) => setField('cpf', mascaraCPF(e.target.value))}
                  />
                </Field>
                <Field label="RG" required error={errors.rg}>
                  <input
                    className={`cm-input cm-mono${errors.rg ? ' cm-input--error' : ''}`}
                    placeholder="MG-00.000.000"
                    value={form.rg}
                    readOnly={editando}
                    onChange={(e) => setField('rg', e.target.value)}
                  />
                </Field>
              </div>

              {/* Endereço */}
              <p className="cm-section-label">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1C4.3 1 2.5 2.8 2.5 5c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4z" stroke="#2B4CFF" strokeWidth="1.2"/>
                  <circle cx="6.5" cy="5" r="1.2" stroke="#2B4CFF" strokeWidth="1.2"/>
                </svg>
                Endereço
              </p>
              <Field label="Endereço completo" required error={errors.endereco}>
                <input
                  className={`cm-input${errors.endereco ? ' cm-input--error' : ''}`}
                  placeholder="Rua, número, bairro, cidade"
                  value={form.endereco}
                  onChange={(e) => setField('endereco', e.target.value)}
                />
              </Field>

              {/* Rendimentos */}
              <div className="cm-rend-header-row">
                <p className="cm-section-label" style={{ margin: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1" y="3" width="11" height="8" rx="1.5" stroke="#2B4CFF" strokeWidth="1.2"/>
                    <path d="M1 6h11M4 6v5M9 6v5" stroke="#2B4CFF" strokeWidth="1.2"/>
                  </svg>
                  Rendimentos
                  <span className="cm-badge">{rendimentos.length}/3</span>
                </p>
                {rendimentos.length < 3 && (
                  <button type="button" className="cm-add-rend" onClick={addRendimento}>
                    + Adicionar
                  </button>
                )}
              </div>

              <AnimatePresence>
                {rendimentos.map((r, i) => (
                  <RendimentoCard
                    key={r._id}
                    rend={r}
                    errors={errors.rendimentos?.[i]}
                    onChange={(updated) => updateRendimento(i, updated)}
                    onRemove={() => removeRendimento(i)}
                  />
                ))}
              </AnimatePresence>

              {rendimentos.length === 0 && (
                <p className="cm-empty-rend">Nenhum rendimento adicionado.</p>
              )}
            </div>

            {/* Footer */}
            <div className="cm-footer">
              <button type="button" className="btn-secondary-hero" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary-hero"
                onClick={handleSalvar}
                disabled={saving}
              >
                {saving
                  ? <span className="cm-spinner" />
                  : (
                    <>
                      {editando ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7h10M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )
                }
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
