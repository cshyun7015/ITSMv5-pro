import React, { useState, useEffect } from 'react';
import { Zap, ZapOff } from 'lucide-react';

/**
 * Mock Controller (Zap Icon)
 * - MSW 활성화 상태를 제어하는 플로팅 컴포넌트
 * - LocalStorage의 'VITE_ENABLE_MOCKS' 값을 토글함
 */
const MockController: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('VITE_ENABLE_MOCKS') === 'true';
    setIsEnabled(saved);
  }, []);

  const toggleMock = () => {
    const nextState = !isEnabled;
    localStorage.setItem('VITE_ENABLE_MOCKS', String(nextState));
    setIsEnabled(nextState);
    
    // 상태 변경 알림 및 페이지 리로드 (MSW 재초기화 필요)
    alert(`Mocking is now ${nextState ? 'ENABLED (ON)' : 'DISABLED (OFF)'}. The page will reload.`);
    window.location.reload();
  };

  return (
    <button
      onClick={toggleMock}
      data-testid="mock-controller-zap"
      className={`fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl z-[9999] hover:scale-110 active:scale-95 ${
        isEnabled 
          ? 'bg-yellow-400 text-black shadow-yellow-400/30' 
          : 'bg-white/10 text-white/30 hover:text-white hover:bg-white/20'
      }`}
      title={isEnabled ? 'Click to Disable Mocks' : 'Click to Enable Mocks'}
    >
      {isEnabled ? <Zap size={24} fill="currentColor" /> : <ZapOff size={24} />}
      {isEnabled && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>
      )}
    </button>
  );
};

export default MockController;
