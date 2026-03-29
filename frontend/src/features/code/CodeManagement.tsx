import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Paging States for Groups only
    const [groupPage, setGroupPage] = useState(0);
    const pageSize = 5; 

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
        if (window.confirm('정말 삭제하시겠습니까? 관련 코드들도 모두 삭제됩니다.')) {
            try {
                await apiCommonCode.deleteGroup(groupId);
                if (selectedGroup?.groupId === groupId) setSelectedGroup(null);
                loadGroups();
            } catch (err) {
                alert('삭제에 실패했습니다. 시스템 보호 중인 코드 그룹일 수 있습니다.');
            }
        }
    };

    const handleCodeDelete = async (id: number) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await apiCommonCode.deleteCode(id);
                if (selectedGroup) loadCodes(selectedGroup.groupId);
            } catch (err) {
                alert('삭제에 실패했습니다.');
            }
        }
    };

    // Derived Paged Groups
    const pagedGroups = groups.slice(groupPage * pageSize, (groupPage + 1) * pageSize);

    return (
        <div className="code-mgmt-vertical-container animate-fade-in">
            
            {/* Top Section: Code Groups Architecture */}
            <section className="management-section">
                <header className="management-header">
                    <div className="management-title-area">
                        <p>SYSTEM ARCHITECTURE</p>
                        <h2>공통 코드 그룹 관리</h2>
                    </div>
                    <button 
                        className="auth-submit" 
                        onClick={() => { setEditingGroup(undefined); setIsGroupModalOpen(true); }}
                        style={{ width: 'auto', padding: '12px 32px' }}
                    >
                        신규 그룹 마스터 등록
                    </button>
                </header>
                
                <div className="premium-table-container">
                    <table className="premium-mgmt-table">
                        <thead>
                            <tr>
                                <th>IDENTITY</th>
                                <th>GROUP NAME</th>
                                <th>SPECIFICATION</th>
                                <th style={{ width: '150px', textAlign: 'center' }}>CONTROL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedGroups.map(g => (
                                <tr 
                                    key={g.groupId} 
                                    className={`clickable ${selectedGroup?.groupId === g.groupId ? 'active' : ''}`}
                                    onClick={() => setSelectedGroup(g)}
                                >
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="id-chip">{g.groupId}</span>
                                            {g.isSystem && <span className="system-tag">SYSTEM</span>}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 800, fontSize: '15px' }}>{g.name}</td>
                                    <td style={{ color: 'hsla(0, 0%, 100%, 0.4)', fontSize: '13px' }}>{g.description || 'No description available'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button className="btn-stepper" onClick={(e) => { e.stopPropagation(); setEditingGroup(g); setIsGroupModalOpen(true); }}>✏️</button>
                                            {!g.isSystem && <button className="btn-stepper" style={{ color: 'hsl(var(--status-high))' }} onClick={(e) => { e.stopPropagation(); handleGroupDelete(g.groupId); }}>🗑️</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mgmt-footer">
                    <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.5 }}>
                        TOTAL {groups.length} CODE GROUPS INITIALIZED
                    </div>
                    <div className="pagination-nexus">
                        <span style={{ fontSize: '13px', fontWeight: 800 }}>REGION {groupPage + 1} / {Math.ceil(groups.length / pageSize)}</span>
                        <div className="page-stepper">
                            <button disabled={groupPage === 0} onClick={() => setGroupPage(p => p - 1)} className="btn-stepper">◀</button>
                            <button disabled={(groupPage + 1) * pageSize >= groups.length} onClick={() => setGroupPage(p => p + 1)} className="btn-stepper">▶</button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="separator-line" />

            {/* Bottom Section: Specific Code Items */}
            <section className="management-section">
                <header className="management-header">
                    <div className="management-title-area">
                        <p>DATA DICTIONARY</p>
                        <h2>
                            {selectedGroup ? `하위 코드 구성 [${selectedGroup.groupId}]` : '구성 요소를 선택하십시오'}
                        </h2>
                    </div>
                    {selectedGroup && (
                        <button 
                            className="auth-submit" 
                            onClick={() => { setEditingCode(undefined); setIsCodeModalOpen(true); }}
                            style={{ width: 'auto', padding: '12px 32px' }}
                        >
                            코드 라이브러리 추가
                        </button>
                    )}
                </header>
                
                <div className="premium-table-container">
                    {selectedGroup ? (
                        loading ? (
                            <div className="loading-state">SYNCHRONIZING REPOSITORY...</div>
                        ) : (
                            <table className="premium-mgmt-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>ORDER</th>
                                        <th>CODE IDENTIFIER</th>
                                        <th>DISPLAY NAME</th>
                                        <th>ATTRIBUTES</th>
                                        <th>STATUS</th>
                                        <th style={{ width: '150px', textAlign: 'center' }}>CONTROL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {codes.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontFamily: 'JetBrains Mono', opacity: 0.5 }}>{c.sortOrder.toString().padStart(2, '0')}</td>
                                            <td><span className="id-chip" style={{ background: 'hsla(var(--brand-secondary), 0.1)', color: 'hsl(var(--brand-secondary))' }}>{c.codeId}</span></td>
                                            <td style={{ fontWeight: 800 }}>{c.codeName}</td>
                                            <td style={{ fontSize: '13px', opacity: 0.6 }}>{c.description || '-'}</td>
                                            <td>
                                                <span className={`status-badge ${c.isActive ? 'active' : 'inactive'}`}>
                                                    {c.isActive ? 'OPERATIONAL' : 'DECOMMISSIONED'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                    <button className="btn-stepper" onClick={() => { setEditingCode(c); setIsCodeModalOpen(true); }}>✏️</button>
                                                    <button className="btn-stepper" style={{ color: 'hsl(var(--status-high))' }} onClick={() => handleCodeDelete(c.id!)}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {codes.length === 0 && (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px', opacity: 0.3, fontStyle: 'italic' }}>데이터가 존재하지 않습니다.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, fontWeight: 900, fontSize: '20px', letterSpacing: '4px' }}>
                            AWAITING SOURCE SELECTION
                        </div>
                    )}
                </div>
            </section>

            <AnimatePresence>
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
            </AnimatePresence>
        </div>
    );
};

export default CodeManagement;
