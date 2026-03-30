/**
 * ITIL v5 Priority Calculation Matrix
 * Higher Impact + Higher Urgency = Higher Priority (P1)
 */
export const calculatePriority = (impact?: string, urgency?: string): string => {
    if (!impact || !urgency) return 'P4';
    
    if (impact === 'HIGH') {
        if (urgency === 'HIGH') return 'P1';
        if (urgency === 'MEDIUM') return 'P2';
        return 'P3';
    } else if (impact === 'MEDIUM') {
        if (urgency === 'HIGH') return 'P2';
        if (urgency === 'MEDIUM') return 'P3';
        return 'P4';
    } else {
        if (urgency === 'HIGH') return 'P3';
        return 'P4';
    }
};

export const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
};

export const formatTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
