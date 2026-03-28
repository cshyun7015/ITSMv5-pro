import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import './Auth.css';

const LoginPage: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ userId, password });
        } catch (err) {
            setError('Check your ID and password again.');
        }
    };

    return (
        <div className="auth-container anime-fade-in">
            <div className="auth-card glass-card shadow-2xl animate-scale-in">
                <div className="auth-header">
                    <h1 className="text-gradient neon-glow">ITSM v5</h1>
                    <p className="subtitle">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>User ID</label>
                        <input 
                            type="text" 
                            value={userId}
                            onChange={e => setUserId(e.target.value)}
                            placeholder="your.id"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-primary auth-submit neon-glow">
                        LOG IN
                    </button>
                    
                    <div className="auth-footer">
                        <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = 'signup'; }}>Sign up for free</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
