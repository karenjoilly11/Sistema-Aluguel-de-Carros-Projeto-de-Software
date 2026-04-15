import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SistemaSection      from '../components/SistemaSection';
import AutomoveisSection   from '../components/AutomoveisSection';
import PedidosSection      from '../components/PedidosSection';
import UsuariosSection     from '../components/UsuariosSection';
import MeuPerfilSection    from '../components/MeuPerfilSection';
import MeusPedidosSection  from '../components/MeusPedidosSection';
import AgentesSection      from '../components/AgentesSection';

// ── Itens de navegação por role ───────────────────────────────────────────────
const NAV_ADMIN = [
  { id: 'clientes', label: 'Clientes', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 16c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
  { id: 'automoveis', label: 'Automóveis', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="6" width="16" height="7" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4 6l2-3h6l2 3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="4.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="13.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )},
  { id: 'pedidos', label: 'Pedidos', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
  { id: 'agentes', label: 'Análise de Pedidos', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 9h12M9 3v12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )},
  { id: 'usuarios', label: 'Usuários', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1 16c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M13 8v4M15 10h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
];

const NAV_CLIENTE = [
  { id: 'perfil', label: 'Meu Perfil', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 16c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
  { id: 'automoveis', label: 'Automóveis', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="6" width="16" height="7" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4 6l2-3h6l2 3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="4.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="13.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )},
  { id: 'pedidos', label: 'Meus Pedidos', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';
  const NAV_ITEMS = isAdmin ? NAV_ADMIN : NAV_CLIENTE;

  const [active, setActive] = useState(isAdmin ? 'clientes' : 'perfil');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() { logout(); navigate('/login'); }

  // Label ativo para a topbar
  const activeLabel = NAV_ITEMS.find((i) => i.id === active)?.label ?? '';

  return (
    <div className="dash-layout">

      {/* ── Sidebar ── */}
      <aside className={`dash-sidebar${sidebarOpen ? ' dash-sidebar--open' : ''}`}>
        <div className="dash-sidebar-logo">
          <span className="navbar-logo-mark" style={{ width: 26, height: 26, fontSize: 11, borderRadius: 7, flexShrink: 0 }}>DE</span>
          <span>Spirit Motors</span>
        </div>

        {/* Badge de role */}
        <div style={{ padding: '0 16px 12px', marginTop: -4 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: isAdmin ? 'var(--blue)' : '#4ade80',
            background: isAdmin ? 'var(--blue-dim)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${isAdmin ? 'rgba(43,76,255,0.3)' : 'rgba(34,197,94,0.25)'}`,
            padding: '3px 10px', borderRadius: 100,
          }}>
            {user?.role}
          </span>
        </div>

        <nav className="dash-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`dash-nav-item${active === item.id ? ' dash-nav-item--active' : ''}`}
              onClick={() => { setActive(item.id); setSidebarOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <a href="/" className="dash-nav-item" style={{ textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L2 8h2v8h4v-5h2v5h4V8h2L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            <span>Landing Page</span>
          </a>
          <button className="dash-nav-item dash-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 16H3a1 1 0 01-1-1V3a1 1 0 011-1h4M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Conteúdo principal ── */}
      <div className="dash-main">
        <header className="dash-topbar">
          <button className="dash-menu-btn" onClick={() => setSidebarOpen(true)}>
            <span /><span /><span />
          </button>
          <div className="dash-topbar-title">{activeLabel}</div>
          <div className="dash-topbar-user">
            <div className="dash-avatar">{user?.nome?.charAt(0).toUpperCase() ?? 'A'}</div>
            <div className="dash-user-info">
              <span className="dash-user-nome">{user?.nome}</span>
              <span className="dash-user-role">{user?.role}</span>
            </div>
          </div>
        </header>

        <main className="dash-content">
          {/* Visão ADMIN */}
          {isAdmin && active === 'clientes'   && <SistemaSection />}
          {isAdmin && active === 'automoveis' && <AutomoveisSection />}
          {isAdmin && active === 'pedidos'    && <PedidosSection />}
          {isAdmin && active === 'agentes'    && <AgentesSection />}
          {isAdmin && active === 'usuarios'   && <UsuariosSection />}

          {/* Visão CLIENTE */}
          {!isAdmin && active === 'perfil'     && <MeuPerfilSection />}
          {!isAdmin && active === 'automoveis' && <AutomoveisSection somenteLeitura />}
          {!isAdmin && active === 'pedidos'    && <MeusPedidosSection />}
        </main>
      </div>
    </div>
  );
}
