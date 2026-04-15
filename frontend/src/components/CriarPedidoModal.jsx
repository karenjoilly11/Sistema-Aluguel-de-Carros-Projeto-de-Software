import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function fmtCpf(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function CriarPedidoModal({ isOpen, onClose, automovel, onSuccess }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ dataInicio: '', dataFim: '', cpfInformado: '', rendaInformada: '', observacao: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [clienteId, setClienteId] = useState(null);

  useEffect(() => {
    if (!isOpen || !token) return;
    fetch('/clientes/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(cliente => setClienteId(cliente?.id ?? null))
      .catch(() => setClienteId(null));
  }, [isOpen, token]);

  useEffect(() => {
    if (isOpen) {
      setForm({ dataInicio: '', dataFim: '', cpfInformado: '', rendaInformada: '', observacao: '' });
      setErro('');
    }
  }, [isOpen]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleCpf(e) {
    set('cpfInformado', fmtCpf(e.target.value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!form.dataInicio || !form.dataFim) {
      setErro('Preencha as datas de retirada e devolução.');
      return;
    }
    if (new Date(form.dataInicio) >= new Date(form.dataFim)) {
      setErro('A data de devolução deve ser após a retirada.');
      return;
    }
    if (!form.cpfInformado || form.cpfInformado.replace(/\D/g, '').length !== 11) {
      setErro('Informe um CPF válido (11 dígitos).');
      return;
    }
    const renda = parseFloat(form.rendaInformada);
    if (!form.rendaInformada || isNaN(renda) || renda <= 0) {
      setErro('Informe sua renda mensal.');
      return;
    }
    if (!clienteId) {
      setErro('Erro ao identificar cliente. Tente novamente.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        cpfInformado: form.cpfInformado,
        rendaInformada: renda,
        observacao: form.observacao || null,
        cliente: { id: clienteId },
        automovel: { id: automovel.id },
        status: 'PENDENTE',
      };

      const res = await fetch('/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.message || `Erro ${res.status}`);
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setErro('Erro ao conectar ao servidor: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const dias = form.dataInicio && form.dataFim && new Date(form.dataInicio) < new Date(form.dataFim)
    ? Math.ceil((new Date(form.dataFim) - new Date(form.dataInicio)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="cm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="cm-panel"
            style={{ maxWidth: 480 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="cm-neon-top" />
            <div className="cm-header">
              <h2 className="cm-title">Solicitar {automovel?.marca} {automovel?.modelo}</h2>
              <button className="cm-close" onClick={onClose}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form className="cm-body" onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 12 }}>

                {/* Foto do carro */}
                {automovel?.urlFoto && (
                  <div style={{ borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', maxHeight: 160, textAlign: 'center' }}>
                    <img
                      src={automovel.urlFoto}
                      alt={`${automovel.marca} ${automovel.modelo}`}
                      style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'cover', display: 'block', width: '100%' }}
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Info do carro */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Placa</span>
                    <strong>{automovel?.placa}</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Diária</span>
                    <strong>R$ {Number(automovel?.valorDiaria).toFixed(2)}</strong>
                  </div>
                </div>

                {/* Datas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label className="cm-label">
                    Retirada <span className="cm-required">*</span>
                    <input className="cm-input" type="date" value={form.dataInicio} onChange={e => set('dataInicio', e.target.value)} required />
                  </label>
                  <label className="cm-label">
                    Devolução <span className="cm-required">*</span>
                    <input className="cm-input" type="date" value={form.dataFim} onChange={e => set('dataFim', e.target.value)} required />
                  </label>
                </div>

                {/* Valor estimado */}
                {dias > 0 && (
                  <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534', padding: '10px 14px', borderRadius: 8, fontSize: 13, color: '#4ade80' }}>
                    <strong>{dias} dia{dias > 1 ? 's' : ''}</strong> · Valor estimado:{' '}
                    <strong>R$ {(automovel?.valorDiaria * dias).toFixed(2)}</strong>
                  </div>
                )}

                {/* Separador */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 4 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Dados para análise financeira
                  </p>
                </div>

                {/* CPF */}
                <label className="cm-label">
                  CPF <span className="cm-required">*</span>
                  <input
                    className="cm-input"
                    type="text"
                    placeholder="000.000.000-00"
                    value={form.cpfInformado}
                    onChange={handleCpf}
                    maxLength={14}
                    required
                  />
                </label>

                {/* Renda */}
                <label className="cm-label">
                  Renda mensal (R$) <span className="cm-required">*</span>
                  <input
                    className="cm-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 5000.00"
                    value={form.rendaInformada}
                    onChange={e => set('rendaInformada', e.target.value)}
                    required
                  />
                </label>

                {/* Observação */}
                <label className="cm-label">
                  Observação <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
                  <textarea
                    className="cm-input"
                    rows={2}
                    placeholder="Ex: Viagem de trabalho, necessito do veículo de segunda a sexta…"
                    value={form.observacao}
                    onChange={e => set('observacao', e.target.value)}
                    style={{ resize: 'vertical', minHeight: 56 }}
                  />
                </label>
              </div>

              {erro && <p className="cm-error">{erro}</p>}

              <div className="cm-footer">
                <button type="button" className="btn-secondary-hero" onClick={onClose} disabled={loading}>Cancelar</button>
                <button type="submit" className="btn-primary-hero" disabled={loading}>
                  {loading ? <span className="cm-spinner" /> : 'Solicitar Aluguel'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
