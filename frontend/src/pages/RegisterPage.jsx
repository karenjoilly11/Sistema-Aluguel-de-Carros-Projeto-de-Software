import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });
  const [erro, setErro]     = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (form.senha !== form.confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      // 1. Cria a conta
      const res = await fetch('/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: form.nome, email: form.email, senha: form.senha }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.message || 'Erro ao criar conta. Tente novamente.');
        return;
      }

      // 2. Login automático após cadastro
      await login(form.email, form.senha);
      navigate('/dashboard');
    } catch {
      setErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg" />

      <div className="login-card" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <div className="login-logo">
          <span className="navbar-logo-mark" style={{ width: 34, height: 34, fontSize: 13, borderRadius: 9 }}>DE</span>
          <span>Spirit Motors</span>
        </div>

        <h1 className="login-title">Criar Conta</h1>
        <p className="login-sub">Preencha os dados para se cadastrar como cliente</p>

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
            <label className="login-label">Nome completo</label>
            <input
              className="login-input"
              type="text"
              placeholder="João da Silva"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="joao@email.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Senha</label>
            <input
              className="login-input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.senha}
              onChange={(e) => set('senha', e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Confirmar senha</label>
            <input
              className="login-input"
              type="password"
              placeholder="Repita a senha"
              value={form.confirmar}
              onChange={(e) => set('confirmar', e.target.value)}
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? <span className="cm-spinner" /> : 'Criar conta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Já tem uma conta?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>
              Fazer login
            </Link>
          </span>
          <a href="/" className="login-back">← Voltar para a landing page</a>
        </div>
      </div>
    </div>
  );
}
