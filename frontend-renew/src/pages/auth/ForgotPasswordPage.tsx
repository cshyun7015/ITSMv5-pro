import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../features/auth/components/AuthLayout';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setSubmitted(true);
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="강력한 보안을 위해 비밀번호 재설정 링크를 전송합니다."
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="label-base label-required">Registered Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="email"
                required
                className="input-base pl-10"
                placeholder="example@itsm.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-lg w-full mt-4"
          >
            링크 전송하기
          </button>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-status-resolved/20 text-status-resolved rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">이메일 전송 완료</h3>
          <p className="text-sm text-text-muted mb-6">
            입력하신 이메일로 비밀번호 재설정 링크가 전송되었습니다. 메일함을 확인해 주세요.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="btn-secondary btn-md w-full"
          >
            다시 시도하기
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/login" title="로그인으로 돌아가기" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={14} /> 로그인으로 돌아가기
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
