import { useState, useEffect, useCallback } from 'react';

const BASE = '/pedidos';

function apiFetch(path, token, options = {}) {
  return fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error(body || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
  });
}

function apiFetchContratos(path, token, options = {}) {
  return fetch(`/contratos${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error(body || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
  });
}

export function usePedidos(token) {
  const [pedidos, setPedidos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [online, setOnline]     = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Carrega pedidos de todos os clientes via endpoint geral
      const data = await fetch('/pedidos/todos', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }).then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      setPedidos(data);
      setOnline(true);
    } catch (e) {
      setError(e.message);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = useCallback(async (dto) => {
    const novo = await apiFetch('', token, { method: 'POST', body: JSON.stringify(dto) });
    setPedidos((prev) => [...prev, novo]);
    return novo;
  }, [token]);

  const cancelar = useCallback(async (id) => {
    await apiFetch(`/${id}`, token, { method: 'DELETE' });
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, status: 'CANCELADO' } : p));
  }, [token]);

  const gerarContrato = useCallback(async (id) => {
    const contrato = await apiFetch(`/${id}/contrato`, token, { method: 'POST' });
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, status: 'APROVADO' } : p));
    return contrato;
  }, [token]);

  const assinarContrato = useCallback(async (contratoId) => {
    return apiFetchContratos(`/${contratoId}/assinar`, token, { method: 'POST' });
  }, [token]);

  return { pedidos, loading, error, online, carregar, criar, cancelar, gerarContrato, assinarContrato };
}
