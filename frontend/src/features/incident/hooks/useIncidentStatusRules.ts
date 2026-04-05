import { useState, useEffect } from 'react';
import { apiIncident } from '../api/apiIncident';
import { DEFAULT_INCIDENT_TRANSITIONS } from '../utils/incidentRules';

export const useIncidentStatusRules = () => {
  const [rules, setRules] = useState<Record<string, string[]>>(DEFAULT_INCIDENT_TRANSITIONS);
  const [loading, setLoading] = useState(true);
  const [isBackendFailed, setIsBackendFailed] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await apiIncident.getTransitions();
        setRules(response.data);
        setIsBackendFailed(false);
      } catch (error) {
        console.warn('Backend status transition rules fetch failed. Falling back to frontend rules.', error);
        setRules(DEFAULT_INCIDENT_TRANSITIONS);
        setIsBackendFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const getAllowedNextStatuses = (currentStatus: string): string[] => {
    const allowed = rules[currentStatus] || [];
    // Always include current status in options
    if (!allowed.includes(currentStatus)) {
      return [currentStatus, ...allowed];
    }
    return allowed;
  };

  const isTransitionAllowed = (current: string, next: string): boolean => {
    const allowed = getAllowedNextStatuses(current);
    return allowed.includes(next);
  };

  return {
    rules,
    loading,
    isBackendFailed,
    getAllowedNextStatuses,
    isTransitionAllowed
  };
};
