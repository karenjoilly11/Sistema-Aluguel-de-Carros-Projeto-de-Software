import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SistemaSection from '../components/SistemaSection';

const NAV_ITEMS = [
  { id: 'clientes', label: 'Clientes', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 16c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [active, setActive] = useState('clientes');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="dash-layout">

      {/* ── Sidebar ── */}
      <aside className={`dash-sidebar${sidebarOpen ? ' dash-sidebar--open' : ''}`}>
        <div className="dash-sidebar-logo">
          <span className="navbar-logo-mark" style={{ width: 26, height: 26, fontSize: 11, borderRadius: 7, flexShrink: 0 }}>DE</span>
          <span>Spirit Motors</span>
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
      {sidebarOpen && (
        <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Conteúdo principal ── */}
      <div className="dash-main">

        {/* Topbar */}
        <header className="dash-topbar">
          <button className="dash-menu-btn" onClick={() => setSidebarOpen(true)}>
            <span /><span /><span />
          </button>
          <div className="dash-topbar-title">
            {NAV_ITEMS.find((i) => i.id === active)?.label}
          </div>
          <div className="dash-topbar-user">
            <div className="dash-avatar">
              {user?.nome?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="dash-user-info">
              <span className="dash-user-nome">{user?.nome}</span>
              <span className="dash-user-role">{user?.role}</span>
            </div>
          </div>
        </header>

        {/* Conteúdo da página ativa */}
        <main className="dash-content">
          {active === 'clientes' && <SistemaSection />}
        </main>
      </div>

    </div>
  );
}
