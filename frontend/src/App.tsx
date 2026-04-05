import { useState, useEffect, useMemo } from 'react';
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
  LogOut,
  Search,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerGovernanceHub from './features/organization/customercompany/CustomerGovernanceHub';
import OperatorGovernanceHub from './features/organization/operatorcompany/OperatorGovernanceHub';
import CodeManagement from './features/code/CodeManagement';
import RequestList from './features/request/RequestList';
import EventManagement from './features/event/EventManagement';
import Dashboard from './features/dashboard/Dashboard';
import IncidentManagement from './features/incident/IncidentManagement';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import ProtectedRoute from './components/common/ProtectedRoute';
import { MockController } from './components/MockController';
import './App.css';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OPER';

  useEffect(() => {
    // Scaling handled natively via responsive CSS (100% width on #root and .app-container)
  }, []);

  const menuItems = useMemo(() => [
    { id: 'dashboard', label: '대시보드 관리', icon: <LayoutDashboard size={18} />, group: 'OPERATIONS' },
    { id: 'events', label: '모니터링 관리', icon: <Database size={18} />, group: 'OPERATIONS' },
    { id: 'incidents', label: '인시던트 관리', icon: <AlertCircle size={18} />, group: 'OPERATIONS' },
    { id: 'requests', label: '서비스 요청 관리', icon: <FileText size={18} />, group: 'OPERATIONS' },
    { id: 'customer_mgmt', label: '고객조직 관리', icon: <UsersIcon size={18} />, group: 'ADMIN', adminOnly: true },
    { id: 'operator_mgmt', label: '운영조직 관리', icon: <ShieldCheck size={18} />, group: 'ADMIN', adminOnly: true },
    { id: 'codes', label: '표준코드 관리', icon: <Settings size={18} />, group: 'ADMIN', adminOnly: true },
  ], []);

  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.label.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesRole = item.adminOnly ? isAdmin : true;
      return matchesSearch && matchesRole;
    });
  }, [menuItems, menuSearch, isAdmin]);

  const renderNavGroup = (groupId: string, title: string) => {
    const groupItems = filteredMenu.filter(item => item.group === groupId);
    if (groupItems.length === 0) return null;

    return (
      <div className="nav-group" key={groupId}>
         {!isCollapsed && <div className="group-title">{title}</div>}
         {groupItems.map(item => (
            <div 
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
              data-tooltip={isCollapsed ? item.label : ''}
            >
              <div className="nav-icon-wrapper">
                {item.icon}
              </div>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {currentView === item.id && (
                <motion.div 
                  layoutId="active-pill" 
                  className="active-pill"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </div>
         ))}
      </div>
    );
  };

  return (
    <div 
      className={`app-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}
    >
      <aside className={`sidebar glass ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="collapse-toggle"
          title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* TOP SECTION: User Profile Card */}
        <div className="profile-identity-card">
          <div className="logo-area">
             <div className="v5-vibe">V5</div>
             {!isCollapsed && <span className="logo-text">ITSM Platform</span>}
          </div>
          
          <div className="user-info-slot">
            <div className="avatar-wrapper pulse-ring">
              {user?.name.substring(0,2).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-company-tag">
                   {user?.companyId === 'MSP' ? 'Managed Service Provider' : user?.companyId}
                </span>
                <div className="role-badge">{user?.role}</div>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH SECTION */}
        {!isCollapsed && (
          <div className="sidebar-search">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="빠른 메뉴 검색..." 
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
            />
            <Command size={12} className="command-key" />
          </div>
        )}

        {/* NAVIGATION MENU */}
        <nav className="nav-menu custom-scrollbar">
          {renderNavGroup('OPERATIONS', '프로세스 관리')}
          {renderNavGroup('ADMIN', '시스템 관리')}
        </nav>

        {/* UTILITIES: Sign Out */}
        <div className="sidebar-footer">
          <div 
            className="nav-item sign-out" 
            onClick={logout} 
            data-tooltip={isCollapsed ? '시스템 종료' : ''}
          >
            <div className="nav-icon-wrapper">
              <LogOut size={18} />
            </div>
            {!isCollapsed && <span className="nav-label">로그아웃 (Exit)</span>}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-gradient">
                {currentView === 'codes' ? '공통 코드 관리' : 
                 currentView === 'customer_mgmt' ? '고객조직 관리' :
                 currentView === 'operator_mgmt' ? '운영조직 관리' :
                 currentView === 'requests' ? '요청 관리' :
                 currentView === 'events' ? '이벤트 관리' :
                 currentView === 'incidents' ? '인시던트 관리' : '시각화 대시보드'}
              </h1>
              <div className="breadcrumbs">
                <Command size={10} style={{marginRight: '6px', opacity: 0.5}} />
                {currentView === 'dashboard' ? 'MAIN' : 'ADMINISTRATION'} &gt; {
                  currentView === 'codes' ? 'STANDARD CODES' : 
                  currentView === 'customer_mgmt' ? 'CLIENT ENTITY' :
                  currentView === 'operator_mgmt' ? 'ORG GOVERNANCE' :
                  currentView === 'requests' ? 'REQUEST LIFE' :
                  currentView === 'events' ? 'OBS STREAM' :
                  currentView === 'incidents' ? 'INCIDENT' : 'DASHBOARD'
                }
              </div>
            </motion.div>
          </AnimatePresence>
        </header>
        
        <div className="content-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="view-wrapper"
            >
              {currentView === 'customer_mgmt' ? <CustomerGovernanceHub /> : 
                currentView === 'operator_mgmt' ? <OperatorGovernanceHub /> : 
                currentView === 'codes' ? <CodeManagement /> : 
                currentView === 'requests' ? <RequestList /> : 
                currentView === 'events' ? <EventManagement /> : 
                currentView === 'incidents' ? <IncidentManagement /> : (
                  <Dashboard />
                )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <>
          <AppContent />
          <MockController />
        </>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
