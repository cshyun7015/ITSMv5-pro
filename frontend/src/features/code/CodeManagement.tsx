import React, { useState, useEffect } from 'react';
import { apiCommonCode } from '../../api/apiCommonCode';
import type { CodeGroup, CommonCode } from '../../api/apiCommonCode';
import CodeGroupModal from './CodeGroupModal';
import CodeModal from './CodeModal';
import './CodeManagement.css';

const CodeManagement: React.FC = () => {
    const [groups, setGroups] = useState<CodeGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<CodeGroup | null>(null);
    const [codes, setCodes] = useState<CommonCode[]>([]);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<CodeGroup | undefined>(undefined);
    const [editingCode, setEditingCode] = useState<CommonCode | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            loadCodes(selectedGroup.groupId);
        } else {
            setCodes([]);
        }
    }, [selectedGroup]);

    const loadGroups = async () => {
        try {
            const res = await apiCommonCode.getGroups();
            setGroups(res.data);
            if (res.data.length > 0 && !selectedGroup) {
                setSelectedGroup(res.data[0]);
            }
        } catch (err) {
            console.error('Failed to load groups', err);
        }
    };

    const loadCodes = async (groupId: string) => {
        try {
            setLoading(true);
            const res = await apiCommonCode.getCodesByGroup(groupId);
            setCodes(res.data);
        } catch (err) {
            console.error('Failed to load codes', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupDelete = async (groupId: string) => {
        if (window.confirm('Delete group and all its codes?')) {
            try {
                await apiCommonCode.deleteGroup(groupId);
                if (selectedGroup?.groupId === groupId) setSelectedGroup(null);
                loadGroups();
            } catch (err) {
                alert('Failed to delete group. It might be system protected.');
            }
        }
    };

    const handleCodeDelete = async (id: number) => {
        if (window.confirm('Delete this code?')) {
            try {
                await apiCommonCode.deleteCode(id);
                if (selectedGroup) loadCodes(selectedGroup.groupId);
            } catch (err) {
                alert('Failed to delete code.');
            }
        }
    };

    return (
        <div className="code-mgmt-container">
            {/* Left Column: Code Groups */}
            <div className="code-groups-panel glass-card">
                <header className="panel-header">
                    <h2>Code Groups</h2>
                    <button 
                        className="btn-primary" 
                        onClick={() => { setEditingGroup(undefined); setIsGroupModalOpen(true); }}
                    >
                        + Add Group
                    </button>
                </header>
                <div className="panel-body">
                    {groups.map(g => (
                        <div 
                            key={g.groupId} 
                            className={`group-item ${selectedGroup?.groupId === g.groupId ? 'active' : ''}`}
                            onClick={() => setSelectedGroup(g)}
                        >
                            <div className="group-top">
                                <span className="group-id">{g.groupId}</span>
                                {g.isSystem && <span className="system-badge">System</span>}
                            </div>
                            <div className="group-name">{g.name}</div>
                            <div className="group-actions">
                                <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); setEditingGroup(g); setIsGroupModalOpen(true); }}>Edit</button>
                                {!g.isSystem && <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); handleGroupDelete(g.groupId); }}>Delete</button>}
                            </div>
                        </div>
                    ))}
                    {groups.length === 0 && <div className="empty-state">No groups found.</div>}
                </div>
            </div>

            {/* Right Column: Code Items */}
            <div className="codes-detail-panel glass-card">
                <header className="panel-header">
                    <h2>
                        {selectedGroup ? `Codes: ${selectedGroup.name}` : 'Select a Group'}
                    </h2>
                    {selectedGroup && (
                        <button 
                            className="btn-primary" 
                            onClick={() => { setEditingCode(undefined); setIsCodeModalOpen(true); }}
                        >
                            + Add Item
                        </button>
                    )}
                </header>
                <div className="panel-body">
                    {selectedGroup ? (
                        loading ? (
                            <div className="empty-state">Syncing data...</div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Sort</th>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {codes.map(c => (
                                        <tr key={c.id}>
                                            <td className="sort-cell">{c.sortOrder}</td>
                                            <td className="code-id-cell">{c.codeId}</td>
                                            <td className="code-name-cell">{c.codeName}</td>
                                            <td>
                                                <span className={`status-badge ${c.isActive ? 'active' : 'inactive'}`}>
                                                    {c.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-ghost" onClick={() => { setEditingCode(c); setIsCodeModalOpen(true); }}>Edit</button>
                                                <button className="btn-ghost" style={{color: '#ff4d4d'}} onClick={() => handleCodeDelete(c.id!)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {codes.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="empty-state">No codes found in this group.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )
                    ) : (
                        <div className="empty-state">Select a group from the left menu to view codes.</div>
                    ) }
                </div>
            </div>

            {isGroupModalOpen && (
                <CodeGroupModal 
                    isOpen={isGroupModalOpen} 
                    onClose={() => setIsGroupModalOpen(false)} 
                    onSaved={loadGroups} 
                    initialData={editingGroup}
                />
            )}
            {isCodeModalOpen && selectedGroup && (
                <CodeModal 
                    isOpen={isCodeModalOpen} 
                    onClose={() => setIsCodeModalOpen(false)} 
                    onSaved={() => loadCodes(selectedGroup.groupId)} 
                    groupId={selectedGroup.groupId}
                    initialData={editingCode}
                />
            )}
        </div>
    );
};

export default CodeManagement;
