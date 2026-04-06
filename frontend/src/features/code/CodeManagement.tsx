import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Edit2, Trash2, Database,  
    ChevronRight, Search, LayoutGrid, ArrowLeft,
    ChevronLeft, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { apiCommonCode } from './api/apiCommonCode';
import type { CodeGroup, CommonCode } from './api/apiCommonCode';
import CodeGroupModal from './CodeGroupModal';
import CodeModal from './CodeModal';

const CodeManagement: React.FC = () => {
    const [level, setLevel] = useState<'group' | 'code'>('group');
    const [groups, setGroups] = useState<CodeGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<CodeGroup | null>(null);
    const [codes, setCodes] = useState<CommonCode[]>([]);
    
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<CodeGroup | undefined>(undefined);
    const [editingCode, setEditingCode] = useState<CommonCode | undefined>(undefined);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const res = await apiCommonCode.getGroups();
            setGroups(res.data);
        } catch (err) {
            console.error('Failed to load groups', err);
        } finally {
            setLoading(false);
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

    const handleEnterGroup = (group: CodeGroup) => {
        setSelectedGroup(group);
        loadCodes(group.groupId);
        setLevel('code');
        setSearchTerm(''); // Reset search when switching levels
    };

    const handleBackToGroups = () => {
        setLevel('group');
        setSelectedGroup(null);
        setCodes([]);
        setSearchTerm('');
    };

    const handleGroupDelete = async (groupId: string) => {
        if (window.confirm('정말 삭제하시겠습니까? 관련 코드들도 모두 삭제됩니다.')) {
            try {
                await apiCommonCode.deleteGroup(groupId);
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

    const filteredGroups = groups.filter(g => 
        g.groupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCodes = codes.filter(c => 
        c.codeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.codeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, level]);

    const totalItems = level === 'group' ? filteredGroups.length : filteredCodes.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedItems = level === 'group' 
        ? filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : filteredCodes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="tw-p-6 tw-bg-[#0f172a] tw-min-h-screen">
            {/* Governance Header & Breadcrumbs */}
            <div className="tw-bg-slate-900/50 tw-border tw-border-white/5 tw-p-6 tw-rounded-none tw-mb-6 tw-backdrop-blur-xl">
                <div className="tw-flex tw-justify-between tw-items-center">
                    <div className="tw-flex tw-items-center tw-gap-8">
                        <div>
                            <h1 className="tw-text-2xl tw-font-black tw-text-white tw-tracking-tight tw-whitespace-nowrap">코드그룹/코드</h1>
                            <p className="tw-text-slate-400 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-widest tw-mt-1 tw-whitespace-nowrap">시스템 공통 코드 관리</p>
                        </div>
                        
                        <div className="tw-w-px tw-h-12 tw-bg-white/10" />
                        
                        {/* Breadcrumbs */}
                        <div className="tw-flex tw-items-center tw-gap-3">
                            <button 
                                onClick={handleBackToGroups}
                                className={`tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-xl tw-text-sm tw-font-bold tw-transition-all tw-whitespace-nowrap ${
                                    level === 'group' ? 'tw-bg-slate-800 tw-text-white tw-shadow-lg' : 'tw-text-slate-500 hover:tw-text-slate-300'
                                }`}
                            >
                                <LayoutGrid size={16} /> 코드 그룹
                            </button>
                            
                            {level === 'code' && selectedGroup && (
                                <>
                                    <ChevronRight size={14} className="tw-text-slate-700" />
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-slate-100 tw-text-slate-900 tw-rounded-xl tw-text-sm tw-font-black tw-shadow-xl tw-shadow-white/5 tw-whitespace-nowrap">
                                        <Database size={16} /> {selectedGroup.name}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="tw-flex tw-items-center tw-gap-4">
                        <div className="tw-relative">
                            <Search className="tw-absolute tw-left-4 tw-top-1/2 tw-translate-y-[-50%] tw-text-slate-600" size={16} />
                            <input 
                                type="text"
                                placeholder={level === 'group' ? "그룹코드 검색..." : "코드 검색..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="tw-bg-black/20 tw-border tw-border-white/5 tw-pl-12 tw-pr-6 tw-py-3 tw-rounded-[18px] tw-text-sm tw-text-white tw-w-60 focus:tw-border-slate-500 tw-transition-all outline-none tw-placeholder-slate-700"
                                data-testid="code-search-input"
                            />
                        </div>
                        
                        {level === 'group' ? (
                            <button 
                                className="tw-bg-slate-50 hover:tw-bg-white tw-text-slate-900 tw-px-6 tw-py-3.5 tw-rounded-2xl tw-text-xs tw-font-black tw-flex tw-items-center tw-gap-2 tw-transition-all tw-shadow-xl tw-whitespace-nowrap"
                                onClick={() => { setEditingGroup(undefined); setIsGroupModalOpen(true); }}
                                data-testid="create-group-btn"
                            >
                                <Plus size={18} /> 코드 그룹 등록
                            </button>
                        ) : (
                            <button 
                                className="tw-bg-indigo-500 hover:tw-bg-indigo-400 tw-text-white tw-px-6 tw-py-3.5 tw-rounded-2xl tw-text-xs tw-font-black tw-flex tw-items-center tw-gap-2 tw-transition-all tw-shadow-xl tw-shadow-indigo-500/20 tw-whitespace-nowrap"
                                onClick={() => { setEditingCode(undefined); setIsCodeModalOpen(true); }}
                                data-testid="create-code-btn"
                            >
                                <Plus size={18} /> 코드 추가
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={level}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="tw-bg-slate-900/40 tw-border tw-border-white/5 tw-rounded-none tw-overflow-hidden tw-backdrop-blur-3xl tw-shadow-2xl">
                        {loading ? (
                            <div className="tw-py-24 tw-px-8 tw-text-center">
                                <div className="tw-inline-block tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-white/5 tw-border-t-slate-500 tw-rounded-full tw-mb-6" />
                                <h3 className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-[0.5em]">데이터 동기화 중...</h3>
                            </div>
                        ) : (
                            <div className="tw-overflow-x-auto">
                                <table className="tw-w-full tw-text-left tw-border-collapse">
                                    <thead>
                                        <tr className="tw-bg-white/[0.02]">
                                            {level === 'group' ? (
                                                <>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">코드그룹 ID</th>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">코드그룹 명</th>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">설명</th>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">Action</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">순서</th>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">코드 ID</th>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">코드 명</th>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">설명</th>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">상태</th>
                                                    <th className="tw-px-6 tw-py-4 tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-border-b tw-border-white/5 tw-text-center">Action</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="tw-divide-y tw-divide-white/5">
                                        {level === 'group' ? (
                                            (paginatedItems as CodeGroup[]).map((g) => (
                                                <tr key={g.groupId} className="group hover:tw-bg-white/[0.02] tw-transition-all" data-testid={`group-row-${g.groupId}`}>
                                                    <td className="tw-px-6 tw-py-4">
                                                        <span className="tw-text-xs tw-font-bold tw-font-mono tw-text-slate-500">
                                                            {g.groupId}
                                                        </span>
                                                    </td>
                                                    <td className="tw-px-6 tw-py-4">
                                                        <div className="tw-flex tw-items-center tw-gap-3">
                                                            <div className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-indigo-500 tw-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                                            <span className="tw-text-sm tw-font-bold tw-text-white group-hover:tw-text-indigo-400 tw-transition-colors">{g.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="tw-px-6 tw-py-4 tw-text-sm tw-text-slate-400">{g.description || '설명이 없습니다.'}</td>
                                                    <td className="tw-px-6 tw-py-4">
                                                        <div className="tw-flex tw-justify-end tw-items-center tw-gap-4">
                                                            <button 
                                                                className="tw-p-2.5 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-xl tw-transition-all"
                                                                onClick={() => { setEditingGroup(g); setIsGroupModalOpen(true); }}
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                className="tw-flex tw-items-center tw-gap-2 tw-bg-white/5 hover:tw-bg-white/10 tw-text-white tw-px-5 tw-py-2.5 tw-rounded-xl tw-text-xs tw-font-semibold tw-transition-all"
                                                                onClick={() => handleEnterGroup(g)}
                                                                data-testid={`view-codes-btn-${g.groupId}`}
                                                            >
                                                                코드 보기 <ChevronRight size={14} />
                                                            </button>
                                                            {!g.isSystem && (
                                                                <button 
                                                                    className="tw-p-2.5 tw-bg-rose-500/10 hover:tw-bg-rose-500/20 tw-text-rose-400 tw-rounded-xl tw-transition-all"
                                                                    onClick={() => handleGroupDelete(g.groupId)}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            (paginatedItems as CommonCode[]).map((c) => (
                                                <tr key={c.id} className="hover:tw-bg-white/[0.01] tw-transition-all" data-testid={`code-row-${c.codeId}`}>
                                                    <td className="tw-px-6 tw-py-4 tw-text-xs tw-font-mono tw-text-slate-500">#{c.sortOrder.toString().padStart(2, '0')}</td>
                                                    <td className="tw-px-6 tw-py-4">
                                                        <span className="tw-text-xs tw-font-bold tw-font-mono tw-text-slate-500">
                                                            {c.codeId}
                                                        </span>
                                                    </td>
                                                    <td className="tw-px-6 tw-py-4 tw-text-sm tw-font-bold tw-text-white">{c.codeName}</td>
                                                    <td className="tw-px-6 tw-py-4 tw-text-sm tw-text-slate-400 tw-max-w-md tw-truncate">{c.description || '-'}</td>
                                                    <td className="tw-px-6 tw-py-4">
                                                        <span className={`tw-px-4 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-semibold tw-tracking-[0.05em] ${
                                                            c.isActive ? 'tw-bg-emerald-500/10 tw-text-emerald-400' : 'tw-bg-slate-800 tw-text-slate-500'
                                                        }`}>
                                                            {c.isActive ? '• 사용 중' : '• 미사용'}
                                                        </span>
                                                    </td>
                                                    <td className="tw-px-6 tw-py-4">
                                                        <div className="tw-flex tw-justify-end tw-gap-3">
                                                            <button 
                                                                className="tw-p-2.5 tw-bg-slate-800 hover:tw-bg-slate-700 tw-rounded-xl tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"
                                                                onClick={() => { setEditingCode(c); setIsCodeModalOpen(true); }}
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                className="tw-p-2.5 tw-bg-rose-500/10 hover:tw-bg-rose-500/20 tw-rounded-xl tw-text-rose-400 tw-transition-all tw-border tw-border-rose-500/10"
                                                                onClick={() => handleCodeDelete(c.id!)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        {((level === 'group' && filteredGroups.length === 0) || (level === 'code' && filteredCodes.length === 0)) && (
                                                <td colSpan={6} className="tw-py-24 tw-px-8 tw-text-center">
                                                    <div className="tw-opacity-10 tw-mb-6 tw-flex tw-justify-center"><Database size={80} /></div>
                                                    <h3 className="tw-text-lg tw-font-semibold tw-text-slate-500 tw-uppercase tw-tracking-[0.5em]">조회된 코드가 없습니다.</h3>
                                                </td>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!loading && totalItems > 0 && (
                            <div className="tw-p-6 tw-bg-white/[0.01] tw-border-t tw-border-white/5 tw-flex tw-justify-between tw-items-center">
                                <div className="tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-widest">
                                    Showing <span className="tw-text-slate-300">{(currentPage-1)*pageSize + 1}</span> to <span className="tw-text-slate-300">{Math.min(currentPage*pageSize, totalItems)}</span> of <span className="tw-text-slate-300">{totalItems}</span> Entries
                                </div>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <button 
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="tw-p-2 tw-rounded-lg tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-500 hover:tw-text-white disabled:tw-opacity-20 tw-transition-all"
                                    >
                                        <ChevronsLeft size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="tw-p-2 tw-rounded-lg tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-500 hover:tw-text-white disabled:tw-opacity-20 tw-transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    
                                    <div className="tw-flex tw-items-center tw-gap-1 tw-px-2">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            // Show limited pages if many
                                            if (totalPages > 7) {
                                                if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                                                    if (Math.abs(page - currentPage) === 2) return <span key={page} className="tw-text-slate-700 tw-px-1">...</span>;
                                                    return null;
                                                }
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`tw-w-8 tw-h-8 tw-rounded-lg tw-text-xs tw-font-bold tw-transition-all ${
                                                        currentPage === page 
                                                            ? 'tw-bg-indigo-500 tw-text-white tw-shadow-lg tw-shadow-indigo-500/20' 
                                                            : 'tw-text-slate-500 hover:tw-bg-white/5 hover:tw-text-slate-300'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="tw-p-2 tw-rounded-lg tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-500 hover:tw-text-white disabled:tw-opacity-20 tw-transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="tw-p-2 tw-rounded-lg tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-500 hover:tw-text-white disabled:tw-opacity-20 tw-transition-all"
                                    >
                                        <ChevronsRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {level === 'code' && (
                <motion.button 
                    id="back-trigger"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="tw-fixed tw-bottom-10 tw-left-10 tw-bg-slate-50 hover:tw-bg-white tw-text-slate-900 tw-px-6 tw-py-4 tw-rounded-[24px] tw-text-xs tw-font-black tw-flex tw-items-center tw-gap-3 tw-shadow-2xl tw-transition-all tw-z-50 tw-transform active:tw-scale-95"
                    onClick={handleBackToGroups}
                >
                    <ArrowLeft size={18} /> 그룹 마스터 목록으로 돌아가기
                </motion.button>
            )}

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
