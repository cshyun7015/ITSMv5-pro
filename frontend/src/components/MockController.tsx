import React, { useState } from 'react';
import { Database, Zap, AlertTriangle, Layers, Clock, ShieldCheck, Power } from 'lucide-react';

export const MockController: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentScenario = sessionStorage.getItem('mock-scenario') || 'default';
  const isMockEnabled = sessionStorage.getItem('mock-enabled') === 'true';

  const setScenario = (scenario: string) => {
    sessionStorage.setItem('mock-scenario', scenario);
    window.location.reload();
  };

  const toggleMock = () => {
    const nextState = !isMockEnabled;
    sessionStorage.setItem('mock-enabled', nextState.toString());
    window.location.reload();
  };

  // Show controller if mocks are enabled via env or session override
  const shouldShow = import.meta.env.VITE_ENABLE_MOCKS === 'true' || isMockEnabled;
  if (!shouldShow && process.env.NODE_ENV !== 'development') {
    // We'll let it render but maybe add a console warn if needed.
    // For now, let's force it to always return the UI so the user can click ENABLE if missing.
  }

  return (
    <div 
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}
      className={`tw-transition-all ${isOpen ? 'tw-w-64' : 'tw-w-14'}`}
    >
      <div className="tw-bg-obsidian/90 tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="tw-w-14 tw-h-14 tw-flex tw-items-center tw-justify-center tw-text-indigo-400 hover:tw-bg-white/5 tw-transition-all"
        >
          <Zap size={24} className={isOpen ? 'tw-rotate-12' : ''} />
        </button>

        {isOpen && (
          <div className="tw-p-4 tw-border-t tw-border-white/5 tw-space-y-3">
             <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                <span className="tw-text-[10px] tw-font-bold tw-text-slate-500 tw-uppercase">MSW Mock Control</span>
                <button onClick={toggleMock} className={`tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-rounded-md tw-text-[10px] tw-font-bold ${isMockEnabled ? 'tw-bg-emerald-500/20 tw-text-emerald-400' : 'tw-bg-white/5 tw-text-slate-400'}`}>
                    <Power size={11} /> {isMockEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
             </div>

             <div className="tw-grid tw-grid-cols-1 tw-gap-2">
                {scenarios.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => setScenario(s.id)}
                      className={`tw-flex tw-items-center tw-gap-3 tw-p-2 tw-rounded-xl tw-text-left tw-transition-all ${currentScenario === s.id ? 'tw-bg-indigo-500/20 tw-text-indigo-300' : 'tw-bg-white/5 tw-text-slate-400 hover:tw-bg-white/10'}`}
                    >
                        <s.icon size={14} />
                        <div className="tw-flex tw-flex-col">
                            <span className="tw-text-[11px] tw-font-bold">{s.label}</span>
                            <span className="tw-text-[9px] tw-opacity-60">{s.desc}</span>
                        </div>
                    </button>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const scenarios = [
  { id: 'default', label: 'Default', desc: 'Mocked standard list', icon: Database },
  { id: 'empty', label: 'Empty State', desc: 'Returns 0 results', icon: Layers },
  { id: 'huge', label: 'Stress Test', desc: 'Returns 200 items', icon: Zap },
  { id: 'error', label: 'API Failure', desc: 'Forces 500 status', icon: AlertTriangle },
  { id: 'delay', label: 'Latency', desc: 'Artificial 3s delay', icon: Clock },
  { id: 'real', label: 'Real API', desc: 'Pass through to backend', icon: ShieldCheck },
];
