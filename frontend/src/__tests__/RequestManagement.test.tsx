import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RequestList from '../features/request/RequestList';
import { apiRequest } from '../features/request/api/apiRequest';

vi.mock('../api/apiRequest', () => ({
    apiRequest: {
        getRequests: vi.fn(),
        getRequest: vi.fn(),
        createRequest: vi.fn(),
        updateRequest: vi.fn(),
        deleteRequest: vi.fn(),
        getComments: vi.fn(),
    }
}));

describe('Request Management CRUD Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock for main list
        (apiRequest.getRequests as any).mockResolvedValue({ data: [] });
    });

    it('1. List View - Empty State', async () => {
        render(<RequestList />);
        expect(screen.getByText('Service Requests')).toBeDefined();
        await waitFor(() => {
            expect(screen.getByText('No service requests found.')).toBeDefined();
        });
    });

    it('2. Create - Open Modal and Submit', async () => {
        render(<RequestList />);
        
        const newBtn = screen.getByText('+ New Request');
        fireEvent.click(newBtn);
        
        expect(screen.getByText('New Service Request')).toBeDefined();
        
        const titleInput = screen.getByPlaceholderText('Brief summary of your request...');
        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        
        (apiRequest.createRequest as any).mockResolvedValue({ data: { id: 100 } });
        
        const submitBtn = screen.getByText('SUBMIT REQUEST');
        fireEvent.click(submitBtn);
        
        await waitFor(() => {
            expect(apiRequest.createRequest).toHaveBeenCalled();
        });
    });

    it('3. Read & Update Status - Open Detail and Click Resolved', async () => {
        const mockRequest = { id: 1, reqNumber: 'REQ-001', title: 'Test Request', status: 'OPEN', priority: 'HIGH', requesterId: 'USER01', createdAt: new Date().toISOString() };
        (apiRequest.getRequests as any).mockResolvedValue({ data: [mockRequest] });
        (apiRequest.getRequest as any).mockResolvedValue({ data: mockRequest });
        (apiRequest.getComments as any).mockResolvedValue({ data: [] });

        render(<RequestList />);
        
        await waitFor(() => {
            const row = screen.getByText('REQ-001');
            fireEvent.click(row);
        });

        await waitFor(() => {
            expect(screen.getByText('Requester: USER01 | Created: ' + new Date(mockRequest.createdAt).toLocaleString())).toBeDefined();
        });

        // Test status update button
        const resolveBtn = screen.getByText('RESOLVED');
        fireEvent.click(resolveBtn);
        
        await waitFor(() => {
            expect(apiRequest.updateRequest).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'RESOLVED' }));
        });
    });

    it('4. Edit Mode - Update Title', async () => {
        const mockRequest = { id: 1, reqNumber: 'REQ-001', title: 'Original Title', status: 'OPEN', priority: 'MEDIUM', createdAt: new Date().toISOString() };
        (apiRequest.getRequests as any).mockResolvedValue({ data: [mockRequest] });
        (apiRequest.getRequest as any).mockResolvedValue({ data: mockRequest });
        (apiRequest.getComments as any).mockResolvedValue({ data: [] });

        render(<RequestList />);
        
        await waitFor(() => fireEvent.click(screen.getByText('REQ-001')));
        
        const editBtn = screen.getByText('EDIT');
        fireEvent.click(editBtn);

        const titleEditInput = screen.getByDisplayValue('Original Title');
        fireEvent.change(titleEditInput, { target: { value: 'Updated Title' } });

        const saveBtn = screen.getByText('SAVE');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(apiRequest.updateRequest).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Updated Title' }));
        });
    });

    it('5. Delete - Confirmation and Trigger', async () => {
        const mockRequest = { id: 1, reqNumber: 'REQ-001', title: 'To Be Deleted', status: 'OPEN', priority: 'LOW', createdAt: new Date().toISOString() };
        (apiRequest.getRequests as any).mockResolvedValue({ data: [mockRequest] });
        (apiRequest.getRequest as any).mockResolvedValue({ data: mockRequest });
        (apiRequest.getComments as any).mockResolvedValue({ data: [] });
        
        // Mock window.confirm
        vi.spyOn(window, 'confirm').mockImplementation(() => true);

        render(<RequestList />);
        
        await waitFor(() => fireEvent.click(screen.getByText('REQ-001')));
        
        const deleteBtn = screen.getByText('DELETE');
        fireEvent.click(deleteBtn);

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(apiRequest.deleteRequest).toHaveBeenCalledWith(1);
        });
    });
});
