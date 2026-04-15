import { useState, useEffect, useCallback } from 'react';

const BASE = '/usuarios';

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

export function useUsuarios(token) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [online, setOnline]     = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('', token);
      setUsuarios(data);
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
    setUsuarios((prev) => [...prev, novo]);
    return novo;
  }, [token]);

  const atualizar = useCallback(async (id, dto) => {
    const atualizado = await apiFetch(`/${id}`, token, { method: 'PUT', body: JSON.stringify(dto) });
    setUsuarios((prev) => prev.map((u) => (u.id === id ? atualizado : u)));
    return atualizado;
  }, [token]);

  const excluir = useCallback(async (id) => {
    await apiFetch(`/${id}`, token, { method: 'DELETE' });
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }, [token]);

  return { usuarios, loading, error, online, carregar, criar, atualizar, excluir };
}
