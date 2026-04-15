import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [erro, setErro]         = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Fundo com gradiente */}
      <div className="login-bg" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="navbar-logo-mark" style={{ width: 34, height: 34, fontSize: 13, borderRadius: 9 }}>DE</span>
          <span>Spirit Motors</span>
        </div>

        <h1 className="login-title">Acesso ao Sistema</h1>
        <p className="login-sub">Entre com suas credenciais para continuar</p>

        {erro && (
          <div className="login-error">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4.5V7M7 9.5v.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {erro}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="admin@driveelite.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="login-field">
            <label className="login-label">Senha</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? <span className="cm-spinner" /> : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Não tem uma conta?{' '}
            <Link to="/registro" style={{ color: 'var(--blue)', fontWeight: 600 }}>
              Criar conta
            </Link>
          </span>
          <a href="/" className="login-back">← Voltar para a landing page</a>
        </div>
      </div>
    </div>
  );
}
