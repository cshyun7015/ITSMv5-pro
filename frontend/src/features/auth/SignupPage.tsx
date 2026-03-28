import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import apiCompany, { type CompanyDTO } from '../../api/apiCompany';
import './Auth.css';

const SignupPage: React.FC = () => {
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        password: '',
        email: '',
        companyId: ''
    });
    const [companies, setCompanies] = useState<CompanyDTO[]>([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await apiCompany.list();
                setCompanies(data);
            } catch (err) {
                console.error('Failed to load companies');
            }
        };
        fetchCompanies();
    }, []);

    const filteredCompanies = companies.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.companyId.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.companyId) {
            setError('Please choose your company.');
            return;
        }
        try {
            await signup(formData);
        } catch (err) {
            setError('Registration failed. Check your information.');
        }
    };

    return (
        <div className="auth-container anime-fade-in">
            <div className="auth-card glass-card shadow-2xl animate-scale-in" style={{ width: '450px' }}>
                <div className="auth-header">
                    <h1 className="text-gradient neon-glow">Join ITSM v5</h1>
                    <p className="subtitle">Create your individual account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Company Search</label>
                        <input 
                            type="text" 
                            placeholder="Type to search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ marginBottom: '8px' }}
                        />
                        <select 
                            size={4}
                            value={formData.companyId}
                            onChange={e => setFormData({...formData, companyId: e.target.value})}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
                            required
                        >
                            {filteredCompanies.map(c => (
                                <option key={c.companyId} value={c.companyId} style={{ background: '#121214', padding: '8px' }}>
                                    {c.name} ({c.companyId})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label>User ID</label>
                            <input 
                                type="text" 
                                value={formData.userId}
                                onChange={e => setFormData({...formData, userId: e.target.value})}
                                placeholder="new.id"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Full name"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="you@company.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            placeholder="Min 8 characters"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-primary auth-submit neon-glow">
                        CREATE ACCOUNT
                    </button>
                    
                    <div className="auth-footer">
                        <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = 'login'; }}>Sign in</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
