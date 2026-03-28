import React from 'react';
import { useAuth } from '../../features/auth/AuthProvider';
import LoginPage from '../../features/auth/LoginPage';
import SignupPage from '../../features/auth/SignupPage';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  const [hash, setHash] = React.useState(window.location.hash);

  React.useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: 'white font-family: sans-serif' }}>
        <div className="animate-pulse">Initializing Secure Session...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (hash === '#signup') {
      return <SignupPage />;
    }
    return <LoginPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
