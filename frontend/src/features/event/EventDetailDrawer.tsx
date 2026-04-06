import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldAlert, CheckCircle, Eye, Info, Clock, Server, Terminal, UserPlus } from 'lucide-react';
import apiEvent from './api/apiEvent';
import type { EventItem } from './api/apiEvent';
import OperatorCompany, { type OperatorDTO } from '../organization/operatorcompany/api/OperatorCompany';

interface Props {
    event: EventItem | null;
    onClose: () => void;
    onUpdated: () => void;
    codes: any;
}

const EventDetailDrawer: React.FC<Props> = ({ event, onClose, onUpdated, codes }) => {
    const [operators, setOperators] = useState<OperatorDTO[]>([]);
    const [selectedOp, setSelectedOp] = useState<string>('');
    const userCompanyId = localStorage.getItem('companyId');

    useEffect(() => {
        if (event) {
            // Fetch potential assignees (Operators from the same company)
            // Fetch potential assignees (Operators)
            OperatorCompany.getAllOperators().then(res => {
                setOperators(res || []);
            });
            setSelectedOp(event.assigneeId || '');
        }
    }, [event, userCompanyId]);

    if (!event) return null;

    const getCodeName = (group: string, codeId: string) => {
        return codes[group]?.find((c: any) => c.codeId === codeId)?.codeName || codeId;
    };

    const handleAction = async (action: 'promote' | 'acknowledge' | 'resolve' | 'cancel' | 'assign') => {
        try {
            if (action === 'promote') {
                await apiEvent.promoteToIncident(event.id);
                alert('인시던트로 승격되었습니다.');
            } else if (action === 'acknowledge') {
                await apiEvent.acknowledgeEvent(event.id);
            } else if (action === 'assign') {
                if (!selectedOp) {
                    alert('배정할 운영자를 선택해 주세요.');
                    return;
                }
                await apiEvent.assignEvent(event.id, selectedOp);
            } else if (action === 'resolve') {
                await apiEvent.updateEvent(event.id, { statusCode: 'RESOLVED' });
            } else if (action === 'cancel') {
                await apiEvent.updateEvent(event.id, { statusCode: 'CANCELLED' });
            }
            onUpdated();
            onClose();
        } catch (err: any) {
            alert('작업 실패: ' + (err.response?.data?.message || err.message));
        }
    };

    const renderJson = (detailStr?: string) => {
        if (!detailStr) return <div className="text-muted italic">상세 데이터가 없습니다.</div>;
        try {
            const json = JSON.parse(detailStr);
            return (
                <div className="code-block">
                    <div className="flex justify-between mb-4 pb-2 border-b border-white border-opacity-5">
                        <span className="text-xs uppercase font-bold text-brand-300">Raw Payload</span>
                        <Terminal size={14} className="text-brand-300" />
                    </div>
                    <pre className="tw-whitespace-pre-wrap">{JSON.stringify(json, null, 2)}</pre>
                </div>
            );
        } catch {
            return <div className="code-block tw-whitespace-pre-wrap">{detailStr}</div>;
        }
    };

    return (
        <AnimatePresence>
            {event && (
                <div className="drawer-overlay" onClick={onClose}>
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="drawer-content"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="drawer-header bg-obsidian-dark">
                            <div className="flex justify-between items-center">
                                <span className="tw-font-mono tw-text-indigo-400 tw-font-bold tw-text-sm">{event.eventNumber}</span>
                                <button onClick={onClose} className="tw-p-2 tw-hover:bg-white tw-hover:bg-opacity-5 tw-rounded-full tw-transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <h2 className="tw-text-2xl tw-font-extrabold tw-text-white tw-mt-2">{event.message}</h2>
                            
                            <div className="tw-flex tw-flex-wrap tw-gap-3 tw-mt-4">
                                {/* Assignment Selector */}
                                <div className="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-bg-opacity-5 tw-p-1 tw-pl-3 tw-rounded-lg tw-border tw-border-white tw-border-opacity-10">
                                    <UserPlus size={14} className="tw-text-muted" />
                                    <select 
                                        className="tw-bg-transparent tw-text-sm tw-outline-none tw-pr-2"
                                        value={selectedOp}
                                        onChange={(e) => setSelectedOp(e.target.value)}
                                    >
                                        <option value="">운영자 선택...</option>
                                        {operators.map(op => (
                                            <option key={op.userId} value={op.userId}>{op.name} ({op.userId})</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => handleAction('assign')}
                                        className="tw-bg-indigo-600 tw-px-3 tw-py-1 tw-rounded tw-text-xs tw-font-bold tw-hover:tw-bg-indigo-700 tw-transition-all"
                                    >
                                        배정
                                    </button>
                                </div>

                                <div className="tw-h-8 tw-w-px tw-bg-white tw-bg-opacity-10 tw-mx-1" />

                                {event.statusCode === 'NEW' && (
                                    <button 
                                        onClick={() => handleAction('acknowledge')}
                                        className="tw-flex tw-items-center tw-gap-2 tw-bg-brand-600 tw-bg-opacity-80 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-bold tw-hover:bg-opacity-100 tw-transition-all"
                                    >
                                        <Eye size={16} /> 인지 처리
                                    </button>
                                )}
                                {(event.statusCode === 'NEW' || event.statusCode === 'ACKNOWLEDGED') && (
                                    <button 
                                        onClick={() => handleAction('promote')}
                                        className="tw-flex tw-items-center tw-gap-2 tw-bg-red-600 tw-bg-opacity-80 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-bold tw-hover:bg-opacity-100 tw-transition-all"
                                    >
                                        <ShieldAlert size={16} /> 장애 승격
                                    </button>
                                )}
                                {event.statusCode !== 'RESOLVED' && (
                                    <button 
                                        onClick={() => handleAction('resolve')}
                                        className="tw-flex tw-items-center tw-gap-2 tw-bg-green-600 tw-bg-opacity-80 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-bold tw-hover:bg-opacity-100 tw-transition-all"
                                    >
                                        <CheckCircle size={16} /> 해결 완료
                                    </button>
                                )}
                                {(event.statusCode === 'NEW' || event.statusCode === 'ACKNOWLEDGED') && (
                                    <button 
                                        onClick={() => handleAction('cancel')}
                                        className="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-bg-opacity-10 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-bold tw-hover:bg-opacity-30 tw-transition-all"
                                    >
                                        <X size={16} /> 취소 처리
                                    </button>
                                )}
                            </div>
                        </header>

                        <div className="drawer-body">
                            {/* Stats Summary */}
                            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                                <div className="tw-bg-white tw-bg-opacity-5 tw-p-4 tw-rounded-xl tw-border tw-border-white tw-border-opacity-5">
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-muted tw-mb-2">
                                        <Info size={14} /> STATUS
                                    </div>
                                    <div className={`tw-font-bold ${
                                        event.statusCode === 'ACKNOWLEDGED' ? 'tw-text-indigo-300' :
                                        event.statusCode === 'PROMOTED' ? 'tw-text-orange-400' :
                                        event.statusCode === 'RESOLVED' ? 'tw-text-green-400' :
                                        event.statusCode === 'CANCELLED' ? 'tw-text-gray-400' : 'tw-text-brand-300'
                                    }`}>
                                        {getCodeName('EV_STATUS', event.statusCode)}
                                    </div>
                                </div>
                                <div className="tw-bg-white tw-bg-opacity-5 tw-p-4 tw-rounded-xl tw-border tw-border-white tw-border-opacity-5">
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-muted tw-mb-2">
                                        <Clock size={14} /> CREATED AT
                                    </div>
                                    <div className="tw-font-bold">{new Date(event.createdAt!).toLocaleString()}</div>
                                </div>
                                <div className="tw-bg-white tw-bg-opacity-5 tw-p-4 tw-rounded-xl tw-border tw-border-white tw-border-opacity-5">
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-muted tw-mb-2">
                                        <Clock size={14} /> OCCURRENCES
                                    </div>
                                    <div className="tw-font-bold tw-text-brand-400">
                                        {event.occurrenceCount || 1} 회 발생
                                        {event.lastOccurredAt && (
                                            <span className="tw-text-[10px] tw-text-muted tw-block">최종: {new Date(event.lastOccurredAt).toLocaleTimeString()}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="tw-bg-white tw-bg-opacity-5 tw-p-4 tw-rounded-xl tw-border tw-border-white tw-border-opacity-5">
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-muted tw-mb-2">
                                        <Eye size={14} /> ASSIGNEE
                                    </div>
                                    <div className="tw-font-bold tw-text-amber-400">
                                        {event.assigneeId || '미배정'}
                                        {event.acknowledgedAt && (
                                            <span className="tw-text-[10px] tw-text-muted tw-block">인지: {new Date(event.acknowledgedAt).toLocaleTimeString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Correlation Path Mock */}
                            <section>
                                <h3 className="tw-text-xs tw-font-bold tw-text-muted tw-uppercase tw-tracking-widest tw-mb-4 tw-flex tw-items-center tw-gap-2">
                                    <Server size={14} /> Correlation Path
                                </h3>
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <div className="tw-p-3 tw-bg-indigo-500 tw-bg-opacity-20 tw-border tw-border-indigo-500 tw-border-opacity-30 tw-rounded-lg tw-text-sm tw-font-mono">API Gateway</div>
                                    <div className="tw-h-px tw-w-8 tw-bg-indigo-500 tw-bg-opacity-30" />
                                    <div className="tw-p-3 tw-bg-white tw-bg-opacity-10 tw-border tw-border-white tw-border-opacity-20 tw-rounded-lg tw-text-sm tw-font-mono tw-text-indigo-400 tw-font-bold">{event.node}</div>
                                    <div className="tw-h-px tw-w-8 tw-bg-indigo-500 tw-bg-opacity-30" />
                                    <div className="tw-p-3 tw-bg-white tw-bg-opacity-10 tw-border tw-border-white tw-border-opacity-20 tw-rounded-lg tw-text-sm tw-font-mono">MariaDB</div>
                                </div>
                            </section>

                            {/* Raw Data */}
                            <section>
                                <h3 className="tw-text-xs tw-font-bold tw-text-muted tw-uppercase tw-tracking-widest tw-mb-4">Internal Details</h3>
                                {renderJson(event.eventDetails)}
                            </section>

                            {/* Related Links */}
                            {event.relatedRequestId && (
                                <section className="tw-p-6 tw-bg-brand-500 tw-bg-opacity-10 tw-border tw-border-brand-500 tw-border-opacity-30 tw-rounded-2xl">
                                    <div className="tw-flex tw-items-center tw-justify-between">
                                        <div>
                                            <div className="tw-text-xs tw-font-bold tw-text-brand-400 tw-uppercase tw-mb-1">Promoted Incident</div>
                                            <div className="tw-text-lg tw-font-extrabold">{event.relatedRequestId}</div>
                                        </div>
                                        <button 
                                            onClick={() => window.location.href = `/incident?search=${event.relatedRequestId}`}
                                            className="tw-p-3 tw-bg-brand-500 tw-bg-opacity-20 tw-rounded-full tw-text-brand-400 hover:tw-bg-brand-500 hover:tw-text-white tw-transition-all"
                                        >
                                            <ExternalLink size={20} />
                                        </button>
                                    </div>
                                </section>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EventDetailDrawer;
