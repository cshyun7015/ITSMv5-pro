import React, { useState, useEffect } from 'react';
import apiEvent from '../../api/apiEvent';
import type { EventItem } from '../../api/apiEvent';
import { apiCommonCode } from '../../api/apiCommonCode';
import type { CommonCode } from '../../api/apiCommonCode';
import EventDetail from './EventDetail';
import './Event.css';

const EventManagement: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [codes, setCodes] = useState<{ [key: string]: CommonCode[] }>({});
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const storedUser = localStorage.getItem('authUser');
    const authUser = storedUser ? JSON.parse(storedUser) : null;
    const isMSP = authUser?.companyId === 'MSP';

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

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await apiEvent.getEvents({ companyId: authUser?.companyId });
            setEvents(res.data.content || []);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const getCodeName = (group: string, codeId: string) => {
        return codes[group]?.find(c => c.codeId === codeId)?.codeName || codeId;
    };

    const getSeverityStyle = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return { color: 'hsl(var(--status-critical))', background: 'hsla(var(--status-critical), 0.1)', border: '1px solid hsla(var(--status-critical), 0.2)' };
            case 'ERROR': return { color: 'hsl(var(--status-critical))', background: 'transparent', border: 'none' };
            case 'WARNING': return { color: 'hsl(var(--status-high))', background: 'hsla(var(--status-high), 0.1)', border: '1px solid hsla(var(--status-high), 0.2)' };
            default: return { color: 'white' };
        }
    };

    return (
        <div className="request-feature">
            <header className="panel-header">
                <h2>EVENT MANAGEMENT</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" onClick={fetchEvents}>Refresh</button>
                    {isMSP && <button className="btn-primary" onClick={() => apiEvent.triggerWebhook({}).then(fetchEvents)}>Simulate Webhook Alert</button>}
                </div>
            </header>

            <div className="premium-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>이벤트 번호</th>
                            <th>발생처</th>
                            <th>대상 노드</th>
                            <th>심각도</th>
                            <th>메시지 요약</th>
                            <th>상태</th>
                            <th>연결 장애</th>
                            <th>발생 일시</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading events...</td></tr>
                        ) : events.map(event => (
                            <tr key={event.id} className="table-row" onClick={() => setSelectedEventId(event.id)}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{event.eventNumber}</td>
                                <td>{getCodeName('EV_SOURCE', event.sourceCode)}</td>
                                <td style={{ fontFamily: 'monospace', opacity: 0.8 }}>{event.node}</td>
                                <td>
                                    <span className="id-chip" style={getSeverityStyle(event.severityCode)}>
                                        {getCodeName('EV_SEVERITY', event.severityCode)}
                                    </span>
                                </td>
                                <td>{event.message}</td>
                                <td>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: event.statusCode === 'PROMOTED' ? 'hsl(var(--brand-primary))' : 'var(--text-muted)' }}>
                                        {getCodeName('EV_STATUS', event.statusCode)}
                                    </span>
                                </td>
                                <td>
                                    {event.relatedRequestId ? (
                                        <span className="id-chip" style={{ background: 'hsla(var(--brand-primary), 0.1)' }}>{event.relatedRequestId}</span>
                                    ) : '-'}
                                </td>
                                <td>{new Date(event.createdAt!).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedEventId && (
                <EventDetail 
                    eventId={selectedEventId} 
                    onClose={() => setSelectedEventId(null)}
                    onUpdated={fetchEvents}
                    codes={codes}
                />
            )}
        </div>
    );
};

export default EventManagement;
