import React, { useState, useEffect } from 'react';
import { apiCommonCode } from '../../api/apiCommonCode';
import type { CodeGroup } from '../../api/apiCommonCode';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    initialData?: CodeGroup;
}

const CodeGroupModal: React.FC<Props> = ({ isOpen, onClose, onSaved, initialData }) => {
    const [formData, setFormData] = useState<CodeGroup>({
        groupId: '',
        name: '',
        description: '',
        isSystem: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (initialData) {
                await apiCommonCode.updateGroup(initialData.groupId, formData);
            } else {
                await apiCommonCode.createGroup(formData);
            }
            onSaved();
            onClose();
        } catch (err) {
            alert('Error saving code group. ID might already exist.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-card">
                <header className="modal-header">
                    <h2>{initialData ? 'Edit Group' : 'Register Group'}</h2>
                    <button className="btn-ghost" onClick={onClose} style={{fontSize: '24px', padding: '0 8px'}}>&times;</button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Group ID</label>
                        <input 
                            type="text"
                            value={formData.groupId}
                            onChange={e => setFormData({...formData, groupId: e.target.value.toUpperCase()})}
                            disabled={!!initialData}
                            placeholder="e.g. USER_ROLE"
                            required
                            style={{fontFamily: 'monospace'}}
                        />
                    </div>

                    <div className="form-group">
                        <label>Group Name</label>
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. User Roles"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            style={{height: '80px'}}
                        />
                    </div>

                    <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <input 
                            type="checkbox"
                            id="isSystem"
                            checked={formData.isSystem}
                            onChange={e => setFormData({...formData, isSystem: e.target.checked})}
                            style={{width: '20px', height: '20px'}}
                        />
                        <label htmlFor="isSystem" style={{margin: 0, cursor: 'pointer'}}>System Protected</label>
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

export default CodeGroupModal;
