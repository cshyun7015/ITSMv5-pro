import React, { useState } from 'react';
import { apiRequest } from '../../api/apiRequest';
import type { RequestItem } from '../../api/apiRequest';
import './Request.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const RequestForm: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
    const [formData, setFormData] = useState<Partial<RequestItem>>({
        title: '',
        description: '',
        priority: 'MEDIUM',
        companyId: localStorage.getItem('companyId') || 'SYSTEM',
        requesterId: localStorage.getItem('userId') || 'admin',
        status: 'OPEN'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiRequest.createRequest(formData as RequestItem);
            onCreated();
            onClose();
        } catch (err) {
            alert('Failed to create request');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="modal-content glass-card shadow-2xl animate-scale-in" style={{ width: '600px' }}>
                <header className="panel-header">
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>New Service Request</h2>
                    <button onClick={onClose} className="btn-ghost" style={{ fontSize: '20px' }}>&times;</button>
                </header>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Request Title</label>
                        <input 
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="Brief summary of your request..."
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label>Priority Level</label>
                            <select 
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value})}
                                style={{ background: 'rgba(255,255,255,0.05)', height: '48px', borderRadius: '8px' }}
                            >
                                <option value="LOW" style={{ background: '#121214' }}>LOW</option>
                                <option value="MEDIUM" style={{ background: '#121214' }}>MEDIUM</option>
                                <option value="HIGH" style={{ background: '#121214' }}>HIGH</option>
                                <option value="CRITICAL" style={{ background: '#121214' }}>CRITICAL</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Service Area</label>
                            <div style={{ color: 'var(--text-secondary)', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>Essential Support</div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>Detailed Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe your issue or request in detail..."
                            style={{ minHeight: '120px' }}
                        />
                    </div>

                    <div className="modal-footer">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="btn-ghost"
                            style={{ padding: '12px' }}
                        >
                            CANCEL
                        </button>
                        <button 
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '12px' }}
                        >
                            SUBMIT REQUEST
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestForm;
