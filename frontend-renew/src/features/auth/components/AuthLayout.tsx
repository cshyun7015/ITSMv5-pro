import React from 'react';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-background-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="w-full max-w-[440px] z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-6 group hover:scale-110 transition-transform duration-500">
            <Shield size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2">
            ITSM V5 PRO
          </h1>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-4"></div>
          <p className="text-xs font-mono text-text-muted uppercase tracking-[0.3em]">
            Enterprise Service Management
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
            {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
          </div>
          
          {children}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
            &copy; 2026 ITSMv5 Pro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
