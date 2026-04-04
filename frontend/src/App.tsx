import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Database, 
  AlertCircle, 
  FileText, 
  Settings, 
  Users as UsersIcon, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import CustomerGovernanceHub from './features/organization/customercompany/CustomerGovernanceHub';
import OperatorGovernanceHub from './features/organization/operatorcompany/OperatorGovernanceHub';
import CodeManagement from './features/code/CodeManagement';
import RequestList from './features/request/RequestList';
import EventManagement from './features/event/EventManagement';
import Dashboard from './features/dashboard/Dashboard';
import IncidentManagement from './features/incident/IncidentManagement';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [scale, setScale] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OPER';

  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 1280;
      const windowWidth = window.innerWidth;
      const newScale = Math.min(windowWidth / baseWidth, 1);
      setScale(newScale);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className={`app-container ${isCollapsed ? 'sidebar-collapsed' : ''}`} 
      style={{ transform: `scale(${scale})` }}
    >
      <aside className={`sidebar glass ${isCollapsed ? 'collapsed' : ''}`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="tw-absolute tw-right-2 tw-top-4 tw-z-50 tw-p-2 tw-bg-white tw-bg-opacity-5 tw-rounded-full tw-hover:bg-opacity-20 tw-transition-all tw-text-indigo-400"
          title={isCollapsed ? '펼치기' : '접기'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="logo-section">
          <h2 className="text-gradient neon-glow">{isCollapsed ? 'V5' : 'ITSM v5'}</h2>
          <p className="subtitle">{isCollapsed ? '' : 'System Admin'}</p>
        </div>
        
        <nav className="nav-menu">
          <div 
            className={`nav-item tw-flex tw-items-center tw-gap-3 ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
            title="대시보드"
          >
            <LayoutDashboard size={18} />
            {!isCollapsed && <span>대시보드</span>}
          </div>
          <div 
            className={`nav-item tw-flex tw-items-center tw-gap-3 ${currentView === 'events' ? 'active' : ''}`}
            onClick={() => setCurrentView('events')}
            title="이벤트 관리"
          >
            <Database size={18} />
            {!isCollapsed && <span>이벤트 관리</span>}
          </div>
          <div 
            className={`nav-item tw-flex tw-items-center tw-gap-3 ${currentView === 'incidents' ? 'active' : ''}`}
            onClick={() => setCurrentView('incidents')}
            title="인시던트 관리"
          >
            <AlertCircle size={18} />
            {!isCollapsed && <span>인시던트 관리</span>}
          </div>
          <div 
            className={`nav-item tw-flex tw-items-center tw-gap-3 ${currentView === 'requests' ? 'active' : ''}`}
            onClick={() => setCurrentView('requests')}
            title="요청 관리"
          >
            <FileText size={18} />
            {!isCollapsed && <span>요청 관리</span>}
          </div>
          
          {isAdmin && (
            <>
              <div 
                className={`nav-item tw-flex tw-items-center tw-gap-3 ${currentView === 'customer_mgmt' ? 'active' : ''}`}
                onClick={() => setCurrentView('customer_mgmt')}
                title="고객조직 관리"
              >
                <UsersIcon size={18} />
                {!isCollapsed && <span>고객조직 관리</span>}
              </div>
              <div 
                className={`nav-item tw-flex tw-items-center tw-gap-3 ${currentView === 'operator_mgmt' ? 'active' : ''}`}
                onClick={() => setCurrentView('operator_mgmt')}
                title="운영조직 관리"
              >
                <ShieldCheck size={18} />
                {!isCollapsed && <span>운영조직 관리</span>}
              </div>
              <div 
                className={`nav-item tw-flex tw-items-center tw-gap-3 ${currentView === 'codes' ? 'active' : ''}`}
                onClick={() => setCurrentView('codes')}
                title="공통코드 관리"
              >
                <Settings size={18} />
                {!isCollapsed && <span>공통코드 관리</span>}
              </div>
            </>
          )}
          <div 
            className="nav-item sign-out tw-flex tw-items-center tw-gap-3" 
            onClick={logout} 
            style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', color: '#ff5555' }}
            title="로그아웃"
          >
            <LogOut size={18} />
            {!isCollapsed && <span>로그아웃</span>}
          </div>
        </nav>
        
        <div className="user-profile glass-card">
          <div className="avatar">{user?.name.substring(0,2).toUpperCase()}</div>
          {!isCollapsed && (
            <div className="info">
              <span className="name">{user?.name}</span>
              <span className="role tw-truncate tw-max-w-[150px]">
                 {user?.role !== 'ROLE_USER' && <span style={{ marginRight: '4px' }}>{user?.role}</span>}
                 ({user?.companyId === 'TEST-COMP-1' ? '고객사1' : (user?.companyId === 'TEST-COMP-2' ? '고객사2' : (user?.companyId === 'MSP' ? '운영사' : user?.companyId))})
              </span>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <h1 className="text-gradient">
            {currentView === 'codes' ? '공통 코드 관리' : 
             currentView === 'customer_mgmt' ? '고객조직 관리' :
             currentView === 'operator_mgmt' ? '운영조직 관리' :
             currentView === 'requests' ? '요청 관리' :
             currentView === 'events' ? '이벤트 관리' :
             currentView === 'incidents' ? '인시던트 관리' : '시스템 대시보드'}
          </h1>
          <div className="breadcrumbs">
            {currentView === 'dashboard' ? '메인' : '시스템 관리'} &gt; {
              currentView === 'codes' ? '공통 코드 관리' : 
              currentView === 'customer_mgmt' ? '고객조직 관리' :
              currentView === 'operator_mgmt' ? '운영조직 관리' :
              currentView === 'requests' ? '요청 관리' :
              currentView === 'events' ? '이벤트 관리' :
              currentView === 'incidents' ? '인시던트 관리' : '대시보드'
            }
          </div>
        </header>
        
        <div className="content-body">
          {currentView === 'customer_mgmt' ? <CustomerGovernanceHub /> : 
            currentView === 'operator_mgmt' ? <OperatorGovernanceHub /> : 
            currentView === 'codes' ? <CodeManagement /> : 
            currentView === 'requests' ? <RequestList /> : 
            currentView === 'events' ? <EventManagement /> : 
            currentView === 'incidents' ? <IncidentManagement /> : (
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
