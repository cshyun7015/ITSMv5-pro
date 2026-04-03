import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { RefreshCw, Search, Filter, AlertTriangle, Bell, Settings, Database, Server, Smartphone, LayoutGrid, List, Clock } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import apiEvent from './api/apiEvent';
import type { EventItem } from './api/apiEvent';
import { apiCommonCode } from '../code/api/apiCommonCode';
import type { CommonCode } from '../code/api/apiCommonCode';
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
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    
    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
    const [isCompactView, setIsCompactView] = useState(false);
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(60000);
    
    // Pagination States
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const sentinelRef = useRef<HTMLDivElement>(null);

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

    // 2. Fetch Events Logic
    const loadEvents = useCallback(async (pageNum: number, isInitial: boolean = false) => {
        if (isInitial) setIsLoading(true);
        else setIsFetchingMore(true);

        try {
            const res = await apiEvent.getEvents({ 
                page: pageNum, 
                size: 20, 
                companyId 
            });
            const newContent = res.data.content || [];
            
            if (isInitial) {
                setEvents(newContent);
            } else {
                setEvents(prev => [...prev, ...newContent]);
            }
            
            setHasMore(!res.data.last);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [companyId]);

    // Initial Load & Page change Load
    useEffect(() => {
        if (page > 0) {
            loadEvents(page);
        }
    }, [page, loadEvents]);

    useEffect(() => {
        setPage(0);
        loadEvents(0, true);
    }, [loadEvents]);

    // 3. Infinite Scroll (Intersection Observer)
    useEffect(() => {
        if (isLoading || !hasMore) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isFetchingMore) {
                setPage(prev => prev + 1);
            }
        }, { threshold: 1.0 });

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [isLoading, hasMore, isFetchingMore]);

    // 4. Auto Refresh
    useEffect(() => {
        if (autoRefreshInterval === 0) return;
        
        const timer = setInterval(() => {
            console.log('Auto refreshing events...');
            setPage(0);
            loadEvents(0, true);
        }, autoRefreshInterval);

        return () => clearInterval(timer);
    }, [autoRefreshInterval, loadEvents]);

    // 5. Filter & Stats
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
            total: events.length,
            new: events.filter(e => e.statusCode === 'NEW').length,
            critical: events.filter(e => e.severityCode === 'CRITICAL').length,
            warning: events.filter(e => e.severityCode === 'WARNING').length,
        };
    }, [events]);

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
                    <span className="label">Total Events</span>
                    <span className="value">{stats.total}</span>
                    <div className="tw-absolute tw-right-4 tw-top-4 tw-opacity-20"><Bell size={48} /></div>
                </div>
                <div className="summary-card">
                    <span className="label">Critical</span>
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
                    <span className="label">Warning</span>
                    <span className="value tw-text-amber-500">{stats.warning}</span>
                    <div className="tw-absolute tw-right-4 tw-top-4 tw-opacity-20"><AlertTriangle size={48} /></div>
                </div>
                <div className="summary-card">
                    <span className="label">New Notifications</span>
                    <span className="value tw-text-brand-400">{stats.new}</span>
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
                                placeholder="Search..." 
                                className="tw-bg-white tw-bg-opacity-5 tw-border tw-border-white tw-border-opacity-10 tw-rounded-lg tw-pl-10 tw-pr-4 tw-py-2 tw-text-sm tw-w-48 focus:tw-outline-none focus:tw-border-brand-500 active:tw-bg-opacity-10 tw-transition-all"
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
                                title="Bento Card View"
                                className={`tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-lg tw-transition-all ${!isCompactView ? 'tw-bg-brand-600 tw-text-white tw-shadow-lg' : 'tw-text-muted tw-hover:tw-text-white tw-hover:tw-bg-white tw-hover:tw-bg-opacity-5'}`}
                            >
                                <LayoutGrid size={20} />
                                <span className="tw-text-xs tw-font-bold">Bento</span>
                            </button>
                            <button 
                                onClick={() => setIsCompactView(true)}
                                title="Compact List View"
                                className={`tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-lg tw-transition-all ${isCompactView ? 'tw-bg-brand-600 tw-text-white tw-shadow-lg' : 'tw-text-muted tw-hover:tw-text-white tw-hover:tw-bg-white tw-hover:tw-bg-opacity-5'}`}
                            >
                                <List size={20} />
                                <span className="tw-text-xs tw-font-bold">Compact</span>
                            </button>
                        </div>

                        <button className="tw-p-2 tw-rounded-lg tw-bg-white tw-bg-opacity-5 tw-border tw-border-white tw-border-opacity-10 tw-text-muted tw-hover:tw-text-white tw-transition-all" onClick={() => loadEvents(0, true)}>
                            <RefreshCw size={18} />
                        </button>
                        {isMSP && (
                            <button 
                                className="tw-bg-brand-500 tw-bg-opacity-80 tw-px-6 tw-py-2 tw-rounded-lg tw-text-sm tw-font-bold tw-hover:tw-bg-opacity-100 tw-transition-all tw-flex tw-items-center tw-gap-2"
                                onClick={() => apiEvent.triggerWebhook({}).then(() => loadEvents(0, true))}
                            >
                                <Settings size={18} /> Simulate
                            </button>
                        )}
                    </div>
                </div>

                {/* Event List Rendering */}
                {isLoading ? (
                    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-64 tw-opacity-50">
                        <div className="tw-animate-spin tw-mb-4"><RefreshCw size={32} /></div>
                        <span className="tw-text-sm tw-font-bold">Loading observability stream...</span>
                    </div>
                ) : (
                    <div className={isCompactView ? "tw-flex tw-flex-col tw-gap-2" : "bento-grid"}>
                        {filteredEvents.map(event => (
                            <div 
                                key={event.id} 
                                className={isCompactView ? "compact-row" : `event-card ${getSeverityStyles(event.severityCode)}`}
                                onClick={() => setSelectedEvent(event)}
                            >
                                {isCompactView ? (
                                    <>
                                        <div className={`tw-w-1.5 tw-h-full tw-absolute tw-left-0 ${
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
                                            <div className="tw-flex-1 tw-truncate tw-text-sm tw-font-medium text-white">{event.message}</div>
                                            <div className="tw-w-40 tw-truncate tw-text-xs tw-text-muted tw-flex tw-items-center tw-gap-2">
                                                <Server size={12} /> {event.node}
                                            </div>
                                            <div className="tw-w-24 tw-text-[10px] tw-text-muted">{new Date(event.createdAt!).toLocaleString([], {month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'})}</div>
                                            <div className="tw-w-20">
                                                <div className={`status-indicator !tw-text-[10px] ${event.statusCode === 'NEW' ? 'tw-text-brand-400' : 'tw-text-muted'}`}>
                                                    <div className="ping-dot !tw-w-1 !tw-h-1" />
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
                                            <div className={`status-indicator ${event.statusCode === 'NEW' ? 'tw-text-brand-400' : 'tw-text-muted'}`}>
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
                                            <span className="event-time">{new Date(event.createdAt!).toLocaleString()}</span>
                                            <span className="tw-font-mono tw-text-white tw-text-opacity-20 tw-text-[10px] tw-font-bold">{event.eventNumber}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Infinite Scroll Sentinel */}
                <div ref={sentinelRef} className="tw-h-10 tw-flex tw-items-center tw-justify-center">
                    {isFetchingMore && (
                        <div className="tw-flex tw-items-center tw-gap-2 tw-text-muted">
                            <RefreshCw size={14} className="tw-animate-spin" />
                            <span className="tw-text-xs tw-font-bold">Loading more events...</span>
                        </div>
                    )}
                    {!hasMore && !isLoading && events.length > 0 && (
                        <span className="tw-text-[10px] tw-uppercase tw-tracking-widest tw-text-muted tw-opacity-50">Stream End</span>
                    )}
                </div>
            </div>

            {/* Slide-over Drawer */}
            <EventDetailDrawer 
                event={selectedEvent} 
                onClose={() => setSelectedEvent(null)}
                onUpdated={() => loadEvents(0, true)}
                codes={codes}
            />
        </div>
    );
};

export default EventManagement;
