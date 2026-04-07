import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, ClipboardList, Monitor, Users, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../auth/useAuthStore';

/**
 * ITSM v5 Core Main Layout (Shell)
 * - MFE 모듈의 통합 및 네비게이션 담당
 * - 사이드바, 헤더, 메인 컨텐츠 영역 구분
 */
const MainLayout: React.FC = () => {
  const location = useLocation();
  const { tenantId, logout } = useAuthStore();

  const menuItems = [
    { name: '대시보드', path: '/dashboard', icon: LayoutDashboard },
    { name: '모니터링', path: '/monitoring', icon: Monitor },
    { name: '인시던트 관리', path: '/incident', icon: AlertCircle },
    { name: '서비스 요청', path: '/request', icon: ClipboardList },
    { name: '고객 조직 관리', path: '/customer-org', icon: Users },
    { name: '운용 조직 관리', path: '/ops-org', icon: Users },
    { name: '표준 코드 관리', path: '/common-code', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background-primary text-text-primary overflow-hidden">
      {/* 사이드바 (LNB) */}
      <aside className="w-64 bg-background-secondary border-r border-white/5 flex flex-col z-50">
        <div className="p-6">
          <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            ITSM V5
          </h1>
          <p className="text-[10px] text-text-muted mt-1 font-mono uppercase tracking-widest leading-none">
            Renewal Standard
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? 'text-cyan-400' : 'text-text-muted group-hover:text-white'} />
                  <span className="text-sm font-bold">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* 상단 헤더 (GNB) */}
        <header className="h-16 bg-background-primary/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-white/20">PATH:</span>
            <span className="text-xs font-bold text-text-secondary tracking-widest uppercase">
              {location.pathname.split('/').filter(Boolean).join(' / ') || 'Home'}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs font-black text-cyan-400 leading-none">{tenantId.toUpperCase()}</span>
              <span className="text-[10px] text-text-muted mt-1 leading-none">Enterprise License</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-background-primary flex items-center justify-center font-bold text-xs">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-8 fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
