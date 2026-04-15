import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function CriarPedidoModal({ isOpen, onClose, automovel, onSuccess }) {
  const { user, token } = useAuth();
  const [form, setForm] = useState({ dataInicio: '', dataFim: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [clienteId, setClienteId] = useState(null);

  // Busca o ID do cliente logado
  useEffect(() => {
    if (!isOpen || !token) return;

    fetch('/clientes/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(cliente => {
        if (cliente?.id) {
          setClienteId(cliente.id);
        } else {
          setClienteId(null);
        }
      })
      .catch(err => {
        console.error('Erro ao buscar cliente:', err);
        setClienteId(null);
      });
  }, [isOpen, token]);

  useEffect(() => {
    if (isOpen) {
      setForm({ dataInicio: '', dataFim: '' });
      setErro('');
    }
  }, [isOpen]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
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

    if (!clienteId) {
      setErro('Erro ao identificar cliente.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        cliente: { id: clienteId },
        automovel: { id: automovel.id },
        status: 'PENDENTE'
      };

      console.log('Enviando pedido:', payload);

      const res = await fetch('/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Resposta:', res.status, res.statusText);

      const data = await res.json().catch(() => ({}));
      console.log('Dados:', data);

      if (!res.ok) {
        setErro(data.message || `Erro ${res.status}: ${res.statusText}`);
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      setErro('Erro ao conectar ao servidor: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="cm-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="cm-neon-top" />
            <div className="cm-header">
              <h2 className="cm-title">
                Solicitar {automovel?.marca} {automovel?.modelo}
              </h2>
              <button className="cm-close" onClick={onClose}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <form className="cm-body" onSubmit={handleSubmit}>
              <div className="cm-field-grid" style={{ display: 'grid', gap: 12 }}>
                <label className="cm-label">
                  Placa: <strong>{automovel?.placa}</strong>
                </label>
                <label className="cm-label">
                  Valor da diária: <strong>R$ {Number(automovel?.valorDiaria).toFixed(2)}</strong>
                </label>

                <label className="cm-label">
                  Data de Retirada <span className="cm-required">*</span>
                  <input
                    className="cm-input"
                    type="date"
                    value={form.dataInicio}
                    onChange={e => set('dataInicio', e.target.value)}
                    required
                  />
                </label>

                <label className="cm-label">
                  Data de Devolução <span className="cm-required">*</span>
                  <input
                    className="cm-input"
                    type="date"
                    value={form.dataFim}
                    onChange={e => set('dataFim', e.target.value)}
                    required
                  />
                </label>

                {form.dataInicio && form.dataFim && new Date(form.dataInicio) < new Date(form.dataFim) && (
                  <div
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid #166534',
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#4ade80'
                    }}
                  >
                    <strong>Valor total estimado:</strong>{' '}
                    R${' '}
                    {(
                      automovel?.valorDiaria *
                      Math.ceil(
                        (new Date(form.dataFim) - new Date(form.dataInicio)) / (1000 * 60 * 60 * 24)
                      )
                    ).toFixed(2)}
                  </div>
                )}
              </div>

              {erro && <p className="cm-error">{erro}</p>}

              <div className="cm-footer">
                <button
                  type="button"
                  className="btn-secondary-hero"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-hero"
                  disabled={loading}
                >
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
