
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Clients from './pages/Clients';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Login from './pages/Login';
import PublicBooking from './pages/PublicBooking';
import SplashScreen from './components/SplashScreen';
import { PageView } from './types';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useApp();
  const [activePage, setActivePage] = useState<PageView>('DASHBOARD');
  // Local state to ensure Splash Screen shows for at least a split second for better UX
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowSplash(false), 800);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (showSplash || loading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'DASHBOARD':
        return <Dashboard onNavigate={setActivePage} />;
      case 'SCHEDULE':
        return <Schedule />;
      case 'CLIENTS':
        return <Clients />;
      case 'FINANCE':
        return <Finance />;
      case 'SETTINGS':
        return <Settings onNavigate={setActivePage} />;
      case 'PUBLIC_BOOKING':
        return <PublicBooking onBack={() => setActivePage('SETTINGS')} />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
