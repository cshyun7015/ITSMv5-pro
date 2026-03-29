import { useState, useEffect, useCallback } from 'react';

export const usePriority = (initialImpact: string = 'LOW', initialUrgency: string = 'LOW') => {
    const [impact, setImpact] = useState(initialImpact);
    const [urgency, setUrgency] = useState(initialUrgency);
    const [priority, setPriority] = useState('P4');

    const calculatePriority = useCallback((imp: string, urg: string) => {
        if (imp === 'HIGH') {
            if (urg === 'HIGH') return 'P1';
            if (urg === 'MEDIUM') return 'P2';
            return 'P3';
        } else if (imp === 'MEDIUM') {
            if (urg === 'HIGH') return 'P2';
            if (urg === 'MEDIUM') return 'P3';
            return 'P4';
        } else {
            if (urg === 'HIGH') return 'P3';
            return 'P4';
        }
    }, []);

    useEffect(() => {
        setPriority(calculatePriority(impact, urgency));
    }, [impact, urgency, calculatePriority]);

    return {
        impact,
        setImpact,
        urgency,
        setUrgency,
        priority,
        calculatePriority
    };
};
