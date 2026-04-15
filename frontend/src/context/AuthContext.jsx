import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

function isTokenValido(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('driveelite_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Remove sessão se o token estiver expirado
      if (parsed?.token && !isTokenValido(parsed.token)) {
        localStorage.removeItem('driveelite_user');
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem('driveelite_user');
      return null;
    }
  });

  const login = useCallback(async (email, senha) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || 'Email ou senha inválidos');
    }

    const data = await res.json();
    // data: { token, nome, email, role }
    localStorage.setItem('driveelite_user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('driveelite_user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token: user?.token ?? null,
    login,
    logout,
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
