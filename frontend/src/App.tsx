import { useState, useEffect } from 'react';
import CustomerGovernanceHub from './features/organization/customercompany/CustomerGovernanceHub';
import OperatorGovernanceHub from './features/organization/operatorcompany/OperatorGovernanceHub';
import CodeManagement from './features/code/CodeManagement';
import RequestList from './features/request/RequestList';
import EventManagement from './features/event/EventManagement';
import Dashboard from './features/dashboard/Dashboard';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function AppContent() {
  // Default view is now Dashboard
  const [currentView, setCurrentView] = useState('dashboard');
  const [scale, setScale] = useState(1);
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OPERATOR';

  // 1280x1024 Responsive Scaling Logic
  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 1280;
      const windowWidth = window.innerWidth;
      const newScale = Math.min(windowWidth / baseWidth, 1); // Scale down only
      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className="app-container" 
      style={{ transform: `scale(${scale})` }}
    >
      <aside className="sidebar glass">
        <div className="logo-section">
          <h2 className="text-gradient neon-glow">ITSM v5</h2>
          <p className="subtitle">System Admin</p>
        </div>
        
        <nav className="nav-menu">
          <div 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            대시보드
          </div>
          <div 
            className={`nav-item ${currentView === 'events' ? 'active' : ''}`}
            onClick={() => setCurrentView('events')}
          >
            이벤트 관리
          </div>
          <div 
            className={`nav-item ${currentView === 'requests' ? 'active' : ''}`}
            onClick={() => setCurrentView('requests')}
          >
            요청 관리
          </div>
          
          {isAdmin && (
            <>
              <div 
                className={`nav-item ${currentView === 'customer_mgmt' ? 'active' : ''}`}
                onClick={() => setCurrentView('customer_mgmt')}
              >
                고객사/사용자 관리
              </div>
              <div 
                className={`nav-item ${currentView === 'operator_mgmt' ? 'active' : ''}`}
                onClick={() => setCurrentView('operator_mgmt')}
              >
                운영사/운영자 관리
              </div>
              <div 
                className={`nav-item ${currentView === 'codes' ? 'active' : ''}`}
                onClick={() => setCurrentView('codes')}
              >
                공통 코드 관리
              </div>
            </>
          )}
          <div className="nav-item sign-out" onClick={logout} style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', color: '#ff5555' }}>
            로그아웃
          </div>
        </nav>
        
        <div className="user-profile glass-card">
          <div className="avatar">{user?.name.substring(0,2).toUpperCase()}</div>
          <div className="info">
            <span className="name">{user?.name}</span>
            <span className="role">
               {user?.role !== 'ROLE_USER' && <span style={{ marginRight: '4px' }}>{user?.role}</span>}
               ({user?.companyId === 'TEST-COMP-1' ? '고객사1' : (user?.companyId === 'TEST-COMP-2' ? '고객사2' : (user?.companyId === 'MSP' ? '운영사' : user?.companyId))})
            </span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {currentView !== 'requests' && currentView !== 'events' && currentView !== 'dashboard' && 
         currentView !== 'customer_mgmt' && currentView !== 'operator_mgmt' && currentView !== 'codes' && (
          <header className="page-header">
            <h1 className="text-gradient">
              {currentView === 'codes' ? '공통 코드 관리' : '시스템 대시보드'}
            </h1>
            <div className="breadcrumbs">
              시스템 관리 &gt; {
                currentView === 'codes' ? '공통 코드 관리' : '대시보드'
              }
            </div>
          </header>
        )}
        
        <div className="content-body">
          {currentView === 'customer_mgmt' ? <CustomerGovernanceHub /> : 
            currentView === 'operator_mgmt' ? <OperatorGovernanceHub /> : 
            currentView === 'codes' ? <CodeManagement /> : 
            currentView === 'requests' ? <RequestList /> : 
            currentView === 'events' ? <EventManagement /> : (
              <Dashboard />
            )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
