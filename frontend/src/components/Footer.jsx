const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="navbar-logo" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M2 14l4-8 3 5 3-3 3 6H2z" fill="#2B4CFF"/>
              <circle cx="17" cy="6" r="3" fill="#2B4CFF" opacity="0.6"/>
            </svg>
            <span style={{ color: '#fff', fontWeight: 700 }}>Spirit Motors</span>
          </span>
          <p className="footer-tagline">Alto padrão em cada quilômetro.</p>
        </div>
        <p className="footer-copy">
          © {YEAR} Spirit Motors · Projeto de Software · PUC Minas
        </p>
      </div>
    </footer>
  );
}
