import apiClient from './apiClient';

export interface EventItem {
    id: number;
    eventNumber: string;
    companyId: string;
    sourceCode: string;
    node: string;
    severityCode: string;
    message: string;
    statusCode: string;
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
