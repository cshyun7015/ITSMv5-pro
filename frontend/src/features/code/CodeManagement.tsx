import React, { useState, useEffect } from 'react';
import { apiCommonCode } from '../../api/apiCommonCode';
import type { CodeGroup, CommonCode } from '../../api/apiCommonCode';
import CodeGroupModal from './CodeGroupModal';
import CodeModal from './CodeModal';

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
        <div className="code-feature" style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100%', paddingBottom: '40px' }}>
            
            {/* Top Section: Code Groups */}
            <div className="pillar glass-card" style={{ width: '100%', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                <header className="pillar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>코드 그룹</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>성격 기반의 그룹 명명 체계</p>
                    </div>
                    <button 
                        className="btn-primary" 
                        onClick={() => { setEditingGroup(undefined); setIsGroupModalOpen(true); }}
                        style={{ minWidth: '120px', height: '44px', padding: '0 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}
                    >
                        등록
                    </button>
                </header>
                
                <div className="pillar-body">
                    <table className="mini-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)' }}>그룹 ID</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)' }}>그룹명</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)' }}>설명</th>
                                <th style={{ width: '120px', textAlign: 'center', padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedGroups.map(g => (
                                <tr 
                                    key={g.groupId} 
                                    className={`pillar-row ${selectedGroup?.groupId === g.groupId ? 'active' : ''}`}
                                    onClick={() => setSelectedGroup(g)}
                                    style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                >
                                    <td style={{ padding: '14px 16px', fontSize: '14px', color: g.isSystem ? 'var(--brand-primary)' : 'white', fontWeight: 600 }}>{g.groupId}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '14px' }}>{g.name}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{g.description || '-'}</td>
                                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setEditingGroup(g); setIsGroupModalOpen(true); }} style={{marginRight: '12px'}}>✏️</button>
                                        {!g.isSystem && <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); handleGroupDelete(g.groupId); }}>🗑️</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer (Pagination for Groups) */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>전체 {groups.length}개 그룹</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button disabled={groupPage === 0} onClick={() => setGroupPage(p => p - 1)} className="btn-mini">◀</button>
                        <span style={{fontSize: '13px', fontWeight: 600}}>페이지 {groupPage + 1}</span>
                        <button disabled={(groupPage + 1) * pageSize >= groups.length} onClick={() => setGroupPage(p => p + 1)} className="btn-mini">▶</button>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Code Items (Linear List, No Paging) */}
            <div className="pillar glass-card" style={{ width: '100%', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                <header className="pillar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                            {selectedGroup ? `하위 코드 목록 [${selectedGroup.groupId}]` : '코드 그룹을 선택해 주세요'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>선택된 그룹에 속한 개별 코드 속성 관리 (전체 목록)</p>
                    </div>
                    {selectedGroup && (
                        <button 
                            className="btn-primary" 
                            onClick={() => { setEditingCode(undefined); setIsCodeModalOpen(true); }}
                            style={{ minWidth: '120px', height: '44px', padding: '0 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}
                        >
                            등록
                        </button>
                    )}
                </header>
                
                <div className="pillar-body">
                    {selectedGroup ? (
                        loading ? (
                            <div className="loading-state">Syncing data...</div>
                        ) : (
                            <table className="main-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: 'var(--text-secondary)' }}>순서</th>
                                        <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: 'var(--text-secondary)' }}>코드 ID</th>
                                        <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: 'var(--text-secondary)' }}>코드명 (표시 이름)</th>
                                        <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: 'var(--text-secondary)' }}>설명</th>
                                        <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: 'var(--text-secondary)' }}>상태</th>
                                        <th style={{ width: '120px', textAlign: 'center', padding: '12px 24px', fontSize: '11px', color: 'var(--text-secondary)' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {codes.map(c => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.sortOrder}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: 'hsl(var(--brand-primary))' }}>{c.codeId}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 600 }}>{c.codeName}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>{c.description || '-'}</td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <span className={`status-badge ${c.isActive ? 'active' : 'inactive'}`}>
                                                    {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                                                <button className="btn-icon" onClick={() => { setEditingCode(c); setIsCodeModalOpen(true); }} style={{ marginRight: '16px' }}>✏️</button>
                                                <button className="btn-icon delete" onClick={() => handleCodeDelete(c.id!)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {codes.length === 0 && (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>정의된 하위 코드가 없습니다.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )
                    ) : (
                        <div className="empty-state" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                            상단 그룹 목록에서 조회하거나 편집할 그룹을 선택해 주세요.
                        </div>
                    )}
                </div>

                {/* Footer (No Paging, just Total Count) */}
                {selectedGroup && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>전체 {codes.length}개 항목 조회됨 (페이징 미적용)</span>
                    </div>
                )}
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

            <style>{`
                .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; filter: grayscale(1); opacity: 0.6; transition: all 0.2s; }
                .btn-icon:hover { opacity: 1; filter: none; transform: scale(1.2); }
                .pillar-row:hover { background: hsla(0, 0%, 100%, 0.05); }
                .pillar-row.active { background: hsla(var(--brand-primary), 0.1); border-left: 4px solid hsl(var(--brand-primary)); }
                .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; border: 1px solid transparent; }
                .status-badge.active { background: rgba(0, 255, 136, 0.1); color: #00ff88; border-color: rgba(0, 255, 136, 0.2); }
                .status-badge.inactive { background: rgba(255, 85, 85, 0.1); color: #ff5555; border-color: rgba(255, 85, 85, 0.2); }
                .btn-mini { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; padding: 4px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
                .btn-mini:hover:not(:disabled) { background: rgba(255,255,255,0.1); border-color: white; }
                .btn-mini:disabled { opacity: 0.3; cursor: not-allowed; }
                .btn-primary { background: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary))); border: none; color: white; cursor: pointer; transition: all 0.2s; }
                .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
                .loading-state { height: 200px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); letter-spacing: 2px; }
            `}</style>
        </div>
    );
};

export default CodeManagement;
