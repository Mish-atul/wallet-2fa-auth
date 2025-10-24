import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  email: string | null;
  walletAddress: string | null;
}

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    email: null,
    walletAddress: null,
  });
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        const tokenData = JSON.parse(atob(parsed.token));

        if (tokenData.exp > Date.now()) {
          setAuthState({
            isAuthenticated: true,
            token: parsed.token,
            email: parsed.email,
            walletAddress: parsed.walletAddress,
          });
        } else {
          localStorage.removeItem('auth');
        }
      } catch {
        localStorage.removeItem('auth');
      }
    }
  }, []);

  const handleLoginSuccess = (token: string, email: string, walletAddress: string) => {
    const newAuthState = {
      isAuthenticated: true,
      token,
      email,
      walletAddress,
    };

    setAuthState(newAuthState);

    localStorage.setItem('auth', JSON.stringify({
      token,
      email,
      walletAddress,
    }));
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      token: null,
      email: null,
      walletAddress: null,
    });
    localStorage.removeItem('auth');
  };

  if (authState.isAuthenticated && authState.email && authState.walletAddress) {
    return (
      <Dashboard
        email={authState.email}
        walletAddress={authState.walletAddress}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'register') {
    return <RegisterPage onSwitchToLogin={() => setCurrentView('login')} />;
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={() => setCurrentView('register')}
    />
  );
}

export default App;
