import apiClient from '../../../api/apiClient';

export interface EventItem {
    id: number;
    eventNumber: string;
    companyId: string;
    sourceCode: string;
    categoryCode?: string;
    node: string;
    severityCode: string;
    message: string;
    eventDetails?: string; // Raw JSON payload
    statusCode: string;
    fingerprint?: string;
    occurrenceCount?: number;
    firstOccurredAt?: string;
    lastOccurredAt?: string;
    assigneeId?: string;
    acknowledgedAt?: string;
    relatedRequestId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const apiEvent = {
    getEvents: (params?: { page?: number; size?: number; companyId?: string }) => {
        const headers: any = {};
        if (params?.companyId) {
            headers['X-Company-ID'] = params.companyId;
        }
        return apiClient.get('/event', {
            params,
            headers
        });
    },

    getEvent: (id: number) => {
        return apiClient.get(`/event/${id}`);
    },

    createEvent: (data: Partial<EventItem>) => {
        return apiClient.post('/event', data);
    },

    updateEvent: (id: number, data: Partial<EventItem>) => {
        return apiClient.put(`/event/${id}`, data);
    },

    acknowledgeEvent: (id: number) => {
        return apiClient.post(`/event/${id}/acknowledge`);
    },
    
    assignEvent: (id: number, assigneeId: string) => {
        return apiClient.post(`/event/${id}/assign`, null, { params: { assigneeId } });
    },
    
    promoteToIncident: (id: number) => {
        return apiClient.post(`/event/${id}/promote`);
    },

    deleteEvent: (id: number) => {
        return apiClient.delete(`/event/${id}`);
    },

    // Webhook simulation for testing
    triggerWebhook: (payload: any) => {
        return apiClient.post('/event/webhook/alertmanager', payload);
    }
};

export default apiEvent;
