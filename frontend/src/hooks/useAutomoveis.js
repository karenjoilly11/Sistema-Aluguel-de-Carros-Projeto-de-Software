import { useState, useEffect, useCallback } from 'react';

const BASE = '/automoveis';

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

export function useAutomoveis(token) {
  const [automoveis, setAutomoveis] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [online, setOnline]         = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('', token);
      setAutomoveis(data);
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
    setAutomoveis((prev) => [...prev, novo]);
    return novo;
  }, [token]);

  const atualizar = useCallback(async (id, dto) => {
    const atualizado = await apiFetch(`/${id}`, token, { method: 'PUT', body: JSON.stringify(dto) });
    setAutomoveis((prev) => prev.map((a) => (a.id === id ? atualizado : a)));
    return atualizado;
  }, [token]);

  const excluir = useCallback(async (id) => {
    await apiFetch(`/${id}`, token, { method: 'DELETE' });
    setAutomoveis((prev) => prev.filter((a) => a.id !== id));
  }, [token]);

  return { automoveis, loading, error, online, carregar, cadastrar, atualizar, excluir };
}
