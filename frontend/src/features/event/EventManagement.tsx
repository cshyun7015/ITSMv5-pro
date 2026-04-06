import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, Search, AlertTriangle, Bell, Settings, Database, Server, Smartphone, LayoutGrid, List, Clock } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import apiEvent from './api/apiEvent';
import type { EventItem } from './api/apiEvent';
import { apiCommonCode } from '../code/api/apiCommonCode';
import type { CommonCode } from '../code/api/apiCommonCode';
import CustomerCompanyAPI from '../organization/customercompany/api/CustomerCompany';
import type { CustomerCompanyDTO } from '../organization/customercompany/api/CustomerCompany';
import EventDetailDrawer from './EventDetailDrawer';
import './Event.css';

const sparklineData = [
    { value: 10 }, { value: 15 }, { value: 8 }, { value: 12 }, { value: 20 }, 
    { value: 14 }, { value: 25 }, { value: 18 }, { value: 30 }, { value: 22 }
];

const REFRESH_OPTIONS = [
    { label: 'OFF', value: 0 },
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
    { label: '1m', value: 60000 },
];

const EventManagement: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [codes, setCodes] = useState<{ [key: string]: CommonCode[] }>({});
    const [customers, setCustomers] = useState<CustomerCompanyDTO[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
    const [filterCompanyId, setFilterCompanyId] = useState<string | null>(null);
    const [isCompactView, setIsCompactView] = useState(false);
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(60000);
    
    // Classic Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const itemsPerPage = 12;

    const storedUser = localStorage.getItem('authUser');
    const authUser = storedUser ? JSON.parse(storedUser) : null;
    const companyId = authUser?.companyId || 'MSP';
    const isMSP = companyId === 'MSP';

    // 1. Fetch Common Codes
    useEffect(() => {
        const fetchCodes = async () => {
            const groups = ['EV_STATUS', 'EV_SOURCE', 'EV_SEVERITY'];
            const newCodes: any = {};
            await Promise.all(groups.map(async (group) => {
                const res = await apiCommonCode.getCodesByGroup(group);
                newCodes[group] = res.data;
            }));
            setCodes(newCodes);
        };
        fetchCodes();
    }, []);

    // 1.1 Fetch Customer List (for MSP)
    useEffect(() => {
        if (isMSP) {
            CustomerCompanyAPI.getCustomerCompanies().then(setCustomers);
        }
    }, [isMSP]);

    // 2. Fetch Events Logic (Classic Pagination Mode)
    const loadEvents = useCallback(async (pageNum: number) => {
        setIsLoading(true);
        try {
            const params: any = { 
                page: pageNum - 1, 
                size: itemsPerPage
            };
            if (filterCompanyId) {
                params.companyId = filterCompanyId;
            }
            const res = await apiEvent.getEvents(params);
            
            // In classic paging, we replace the content, not append
            setEvents(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalElements(res.data.totalElements || 0);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setIsLoading(false);
        }
    }, [filterCompanyId]);

    // Initial Load & Filter change Load
    useEffect(() => {
        loadEvents(currentPage);
    }, [currentPage, loadEvents, filterCompanyId]);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 on filter change
    }, [filterCompanyId]);

    // 4. Auto Refresh (Refreshes current page only)
    useEffect(() => {
        if (autoRefreshInterval === 0) return;
        const timer = setInterval(() => {
            loadEvents(currentPage);
        }, autoRefreshInterval);
        return () => clearInterval(timer);
    }, [autoRefreshInterval, currentPage, loadEvents]);

    // 5. Filter & Stats (Local search filter)
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const matchesSearch = e.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 e.node.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSeverity = filterSeverity ? e.severityCode === filterSeverity : true;
            return matchesSearch && matchesSeverity;
        });
    }, [events, searchQuery, filterSeverity]);

    const stats = useMemo(() => {
        return {
            total: totalElements,
            new: events.filter(e => e.statusCode === 'NEW').length, // Calculated from current page load
            critical: events.filter(e => e.severityCode === 'CRITICAL').length,
            warning: events.filter(e => e.severityCode === 'WARNING').length,
        };
    }, [events, totalElements]);

    const getCodeName = (group: string, codeId: string) => {
        return codes[group]?.find(c => c.codeId === codeId)?.codeName || codeId;
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'DATADOG': return <Server size={14} />;
            case 'ZABBIX': return <Database size={14} />;
            case 'PRM_GRF': return <Smartphone size={14} />;
            default: return <Bell size={14} />;
        }
    };

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'severity-critical';
            case 'WARNING': return 'severity-high';
            default: return 'severity-info';
        }
    };

    return (
        <div className="event-container">
            {/* Header Bento Cards */}
            <div className="bento-header">
                <div className="summary-card">
                    <span className="label">Total Managed Events</span>
                    <span className="value">{totalElements}</span>
                    <div className="tw-absolute tw-right-4 tw-top-4 tw-opacity-20"><Bell size={48} /></div>
                </div>
                <div className="summary-card">
                    <span className="label">Critical Hits</span>
                    <span className="value tw-text-red-500">{stats.critical}</span>
                    <div className="tw-absolute tw-right-2 tw-bottom-2 tw-w-24 tw-h-12 tw-opacity-30">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineData}>
                                <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="label">Warning Alerts</span>
                    <span className="value tw-text-amber-500">{stats.warning}</span>
                    <div className="tw-absolute tw-right-4 tw-top-4 tw-opacity-20"><AlertTriangle size={48} /></div>
                </div>
                <div className="summary-card">
                    <span className="label">System Healthy</span>
                    <span className="value tw-text-brand-400">100%</span>
                    <div className="tw-absolute tw-right-2 tw-bottom-2 tw-w-24 tw-h-12 tw-opacity-30">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[...sparklineData].reverse()}>
                                <Area type="monotone" dataKey="value" stroke="#4a90e2" fill="#4a90e2" fillOpacity={0.4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Content Section Area */}
            <div className="tw-space-y-6">
                <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-sticky tw-top-[-32px] tw-z-[100] tw-py-4 tw-px-2 tw-bg-obsidian tw-bg-opacity-95 tw-backdrop-blur-2xl tw-border-b tw-border-white tw-border-opacity-10 tw-shadow-2xl tw-gap-y-4">
                    <div className="tw-flex tw-items-center tw-gap-4">
                        <div className="tw-relative">
                            <Search size={16} className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-text-muted" />
                            <input 
                                type="text" 
                                placeholder="Search observability stream..." 
                                className="tw-bg-white tw-bg-opacity-5 tw-border tw-border-white tw-border-opacity-10 tw-rounded-lg tw-pl-10 tw-pr-4 tw-py-2 tw-text-sm tw-w-64 focus:tw-outline-none focus:tw-border-brand-500 active:tw-bg-opacity-10 tw-transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="tw-flex tw-bg-white tw-bg-opacity-5 tw-p-1 tw-rounded-lg tw-border tw-border-white tw-border-opacity-10">
                            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
                                <button 
                                    key={sev}
                                    onClick={() => setFilterSeverity(sev === 'ALL' ? null : sev)}
                                    className={`tw-px-4 tw-py-1 tw-rounded-md tw-text-xs tw-font-bold tw-transition-all ${
                                        (sev === 'ALL' ? !filterSeverity : filterSeverity === sev) 
                                        ? 'tw-bg-white tw-bg-opacity-10 tw-text-white tw-shadow-lg' 
                                        : 'tw-text-muted tw-hover:tw-text-white'
                                    }`}
                                >
                                    {sev}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="tw-flex tw-items-center tw-gap-4">
                        {isMSP && (
                            <div className="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-bg-opacity-5 tw-px-4 tw-py-1.5 tw-rounded-xl tw-border tw-border-white tw-border-opacity-10 tw-shadow-inner">
                                <Database size={14} className="tw-text-brand-400" />
                                <select 
                                    value={filterCompanyId || 'ALL'}
                                    onChange={(e) => setFilterCompanyId(e.target.value === 'ALL' ? null : e.target.value)}
                                    className="tw-bg-transparent tw-text-xs tw-font-bold tw-text-white tw-outline-none tw-cursor-pointer hover:tw-text-brand-400 tw-transition-colors"
                                >
                                    <option value="ALL" className="tw-bg-obsidian tw-text-white">전체 고객사</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.customerId} className="tw-bg-obsidian tw-text-white">
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Auto Refresh Select */}
                        <div className="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-bg-opacity-5 tw-px-3 tw-py-1.5 tw-rounded-lg tw-border tw-border-white tw-border-opacity-10">
                            <Clock size={14} className="tw-text-muted" />
                            <select 
                                value={autoRefreshInterval}
                                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                                className="tw-bg-transparent tw-text-xs tw-font-bold tw-text-white tw-outline-none"
                            >
                                {REFRESH_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="tw-bg-obsidian tw-text-white">{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="tw-flex tw-bg-obsidian-light tw-p-1.5 tw-rounded-xl tw-border tw-border-white tw-border-opacity-10 tw-shadow-inner">
                            <button 
                                onClick={() => setIsCompactView(false)}
                                className={`tw-p-2 tw-rounded-lg tw-transition-all ${!isCompactView ? 'tw-bg-brand-600 tw-text-white' : 'tw-text-muted hover:tw-text-white'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button 
                                onClick={() => setIsCompactView(true)}
                                className={`tw-p-2 tw-rounded-lg tw-transition-all ${isCompactView ? 'tw-bg-brand-600 tw-text-white' : 'tw-text-muted hover:tw-text-white'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <button className="tw-p-2 tw-rounded-lg tw-bg-white tw-bg-opacity-5 tw-border tw-border-white tw-border-opacity-10 tw-text-muted hover:tw-text-white" onClick={() => loadEvents(currentPage)}>
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Event List Rendering */}
                {isLoading ? (
                    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-64 tw-opacity-50">
                        <div className="tw-animate-spin tw-mb-4"><RefreshCw size={32} /></div>
                        <span className="tw-text-sm tw-font-bold">Updating dashboard data...</span>
                    </div>
                ) : (
                    <div className={isCompactView ? "tw-flex tw-flex-col tw-gap-2" : "bento-grid"}>
                        {isCompactView && (
                            <div className="tw-flex tw-items-center tw-gap-4 tw-px-4 tw-py-2 tw-bg-white tw-bg-opacity-5 tw-rounded-lg tw-border tw-border-white tw-border-opacity-5 tw-mb-2">
                                <div className="tw-w-32 tw-text-[10px] tw-font-black tw-text-indigo-400 tw-uppercase">이벤트 번호</div>
                                <div className="tw-w-24 tw-text-[10px] tw-font-black tw-text-muted tw-uppercase">소스</div>
                                <div className="tw-flex-1 tw-text-[10px] tw-font-black tw-text-muted tw-uppercase tw-max-w-[20vw]">메시지</div>
                                <div className="tw-w-40 tw-text-[10px] tw-font-black tw-text-muted tw-uppercase">대상 노드</div>
                                <div className="tw-w-24 tw-text-[10px] tw-font-black tw-text-muted tw-uppercase">발생 시각</div>
                                <div className="tw-w-20 tw-text-[10px] tw-font-black tw-text-muted tw-uppercase">상태</div>
                            </div>
                        )}
                        {filteredEvents.map(event => {
                            return (
                                <div 
                                    key={event.id} 
                                    className={`${isCompactView ? "compact-row" : `event-card ${getSeverityStyles(event.severityCode)}`}`}
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    {isCompactView ? (
                                        <>
                                            <div className={`tw-w-1 tw-h-full tw-absolute tw-left-0 ${
                                                event.severityCode === 'CRITICAL' ? 'tw-bg-red-500' : 
                                                event.severityCode === 'WARNING' ? 'tw-bg-amber-500' : 'tw-bg-blue-500'
                                            }`} />
                                            <div className="tw-flex tw-items-center tw-gap-4 tw-w-full tw-px-4">
                                                <div className="tw-w-32 tw-text-[10px] tw-font-bold tw-font-mono tw-text-indigo-400">{event.eventNumber}</div>
                                                <div className="tw-w-24">
                                                    <div className="source-tag !tw-py-0.5 !tw-px-2">
                                                        {getCodeName('EV_SOURCE', event.sourceCode)}
                                                    </div>
                                                </div>
                                                <div className="tw-flex-1 tw-truncate tw-text-sm tw-font-medium text-white tw-max-w-[20vw]">{event.message}</div>
                                                <div className="tw-w-40 tw-truncate tw-text-xs tw-text-muted tw-flex tw-items-center tw-gap-2">
                                                    <Server size={12} /> {event.node}
                                                </div>
                                                <div className="tw-w-24 tw-text-[10px] tw-text-muted">{new Date(event.createdAt!).toLocaleString([], {month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'})}</div>
                                                <div className="tw-w-20">
                                                    <div className={`status-indicator !tw-text-[10px] ${
                                                        event.statusCode === 'NEW' ? 'tw-text-brand-400' : 
                                                        event.statusCode === 'ACKNOWLEDGED' ? 'acknowledged' : 'tw-text-muted'
                                                    }`}>
                                                        {getCodeName('EV_STATUS', event.statusCode)}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="card-top">
                                                <div className="source-tag">
                                                    {getSourceIcon(event.sourceCode)}
                                                    {getCodeName('EV_SOURCE', event.sourceCode)}
                                                </div>
                                                <div className={`status-indicator ${
                                                    event.statusCode === 'NEW' ? 'tw-text-brand-400' : 
                                                    event.statusCode === 'ACKNOWLEDGED' ? 'acknowledged' : 'tw-text-muted'
                                                }`}>
                                                    <div className="ping-dot" />
                                                    {getCodeName('EV_STATUS', event.statusCode)}
                                                </div>
                                            </div>
                                            <div className="card-content">
                                                <h3 className="event-message">{event.message}</h3>
                                                <div className="tw-flex tw-items-center tw-gap-2 tw-mt-2">
                                                    <Server size={12} className="tw-text-muted" />
                                                    <span className="event-node">{event.node}</span>
                                                </div>
                                            </div>
                                            <div className="card-footer">
                                                <span className="event-time">
                                                    {new Date(event.createdAt!).toLocaleString()}
                                                </span>
                                                <span className="tw-font-mono tw-text-white tw-text-opacity-20 tw-text-[10px] tw-font-bold">{event.eventNumber}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 🔢 Classic Pagination Controls - Consistent Styling */}
                {totalPages > 1 && (
                    <div className="tw-flex tw-justify-center tw-items-center tw-mt-10 tw-gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(1)}
                            className="tw-w-9 tw-h-9 tw-rounded-lg tw-bg-white/5 tw-text-slate-500 hover:tw-bg-white/10 disabled:tw-opacity-20 tw-transition-all"
                        >«</button>
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="tw-w-9 tw-h-9 tw-rounded-lg tw-bg-white/5 tw-text-slate-500 hover:tw-bg-white/10 disabled:tw-opacity-20 tw-transition-all"
                        >‹</button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                             let pageNum = currentPage;
                             if (currentPage <= 3) pageNum = i + 1;
                             else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                             else pageNum = currentPage - 2 + i;
                             
                             if (pageNum <= 0 || pageNum > totalPages) return null;

                             return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`tw-w-9 tw-h-9 tw-rounded-lg tw-text-xs tw-font-black tw-transition-all ${currentPage === pageNum ? 'tw-bg-brand-600 tw-text-white tw-shadow-lg tw-shadow-brand-600/20' : 'tw-bg-white/5 tw-text-slate-500 hover:tw-bg-white/10'}`}
                                >
                                    {pageNum}
                                </button>
                             );
                        })}

                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="tw-w-9 tw-h-9 tw-rounded-lg tw-bg-white/5 tw-text-slate-500 hover:tw-bg-white/10 disabled:tw-opacity-20 tw-transition-all"
                        >›</button>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                            className="tw-w-9 tw-h-9 tw-rounded-lg tw-bg-white/5 tw-text-slate-500 hover:tw-bg-white/10 disabled:tw-opacity-20 tw-transition-all"
                        >»</button>
                    </div>
                )}
                
                <div className="tw-text-center tw-mt-4 tw-text-[10px] tw-text-muted tw-opacity-50 tw-font-bold tw-uppercase tw-tracking-widest">
                    Showing Page {currentPage} of {totalPages} ({totalElements} Records)
                </div>
            </div>

            {/* Slide-over Drawer */}
            <EventDetailDrawer 
                event={selectedEvent} 
                onClose={() => setSelectedEvent(null)}
                onUpdated={() => loadEvents(currentPage)}
                codes={codes}
            />
        </div>
    );
};

export default EventManagement;
