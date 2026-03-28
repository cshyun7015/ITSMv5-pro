import React, { useState, useEffect } from 'react';
import { apiCommonCode } from '../../api/apiCommonCode';
import type { CommonCode } from '../../api/apiCommonCode';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    groupId: string;
    initialData?: CommonCode;
}

const CodeModal: React.FC<Props> = ({ isOpen, onClose, onSaved, groupId, initialData }) => {
    const [formData, setFormData] = useState<CommonCode>({
        groupId: groupId,
        codeId: '',
        codeName: '',
        description: '',
        sortOrder: 0,
        isActive: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(prev => ({...prev, groupId}));
        }
    }, [initialData, groupId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (initialData?.id) {
                await apiCommonCode.updateCode(initialData.id, formData);
            } else {
                await apiCommonCode.createCode(formData);
            }
            onSaved();
            onClose();
        } catch (err) {
            alert('Error saving code item. Check for ID uniqueness.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-card">
                <header className="modal-header">
                    <h2>{initialData ? 'Edit Item' : 'Register Item'}</h2>
                    <span className="system-badge" style={{color: 'hsl(var(--brand-primary))', borderColor: 'hsla(184, 100%, 50%, 0.3)'}}>{groupId}</span>
                    <button className="btn-ghost" onClick={onClose} style={{fontSize: '24px', padding: '0 8px'}}>&times;</button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        <div className="form-group">
                            <label>Code ID</label>
                            <input 
                                type="text"
                                value={formData.codeId}
                                onChange={e => setFormData({...formData, codeId: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                                disabled={!!initialData}
                                placeholder="e.g. ROLE_ADMIN"
                                required
                                style={{fontFamily: 'monospace', color: 'hsl(var(--brand-primary))'}}
                            />
                        </div>

                        <div className="form-group">
                            <label>Sort Order</label>
                            <input 
                                type="number"
                                value={formData.sortOrder}
                                onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Code Name</label>
                        <input 
                            type="text"
                            value={formData.codeName}
                            onChange={e => setFormData({...formData, codeName: e.target.value})}
                            placeholder="e.g. Administrator"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            style={{height: '60px'}}
                        />
                    </div>

                    <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <input 
                            type="checkbox"
                            id="isActiveCode"
                            checked={formData.isActive}
                            onChange={e => setFormData({...formData, isActive: e.target.checked})}
                            style={{width: '20px', height: '20px'}}
                        />
                        <label htmlFor="isActiveCode" style={{margin: 0, cursor: 'pointer'}}>Active Status</label>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">{initialData ? 'Update' : 'Confirm'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CodeModal;
