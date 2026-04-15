import { useState, useEffect, useCallback } from 'react';

const BASE = '/clientes';

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

export function useClientes(token) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [online, setOnline]     = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('', token);
      setClientes(data);
      setOnline(true);
    } catch (e) {
      setError(e.message);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { carregar(); }, [carregar]);

  const cadastrar = useCallback(async (dto) => {
    const novo = await apiFetch('', token, { method: 'POST', body: JSON.stringify(dto) });
    setClientes((prev) => [...prev, novo]);
    return novo;
  }, [token]);

  const atualizar = useCallback(async (id, dto) => {
    const atualizado = await apiFetch(`/${id}`, token, { method: 'PUT', body: JSON.stringify(dto) });
    setClientes((prev) => prev.map((c) => (c.id === id ? atualizado : c)));
    return atualizado;
  }, [token]);

  const excluir = useCallback(async (id) => {
    await apiFetch(`/${id}`, token, { method: 'DELETE' });
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }, [token]);

  const buscarPorId = useCallback(async (id) => {
    return apiFetch(`/${id}`, token);
  }, [token]);

  return { clientes, loading, error, online, carregar, cadastrar, atualizar, excluir, buscarPorId };
}
