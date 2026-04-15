import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SuperiorServiceSection from './components/SuperiorServiceSection';
import ServicesSection from './components/ServicesSection';
import FleetSection from './components/FleetSection';
import BenefitsSection from './components/BenefitsSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

import './App.css';

// ── Landing page pública ──────────────────────────────────────────
function LandingPage() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <HeroSection />
        <SuperiorServiceSection />
        <ServicesSection />
        <FleetSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

// ── Rota protegida: redireciona para /login se não autenticado ────
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// ── Rota de login: redireciona para /dashboard se já logado ──────
function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

// ── App principal com roteamento ─────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />

          {/* Qualquer rota desconhecida volta para a raiz */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
