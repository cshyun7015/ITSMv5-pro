import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeManagement from '../features/code/CodeManagement';
import { apiCommonCode } from '../api/apiCommonCode';

// Mock apiCommonCode
vi.mock('../api/apiCommonCode', () => ({
    apiCommonCode: {
        getGroups: vi.fn(),
        getCodesByGroup: vi.fn(),
        deleteGroup: vi.fn(),
        deleteCode: vi.fn(),
    }
}));

describe('Common Code Management UI', () => {
    const mockGroups = [
        { groupId: 'G1', name: 'Group 1', description: 'Desc 1', isSystem: false },
        { groupId: 'G2', name: 'Group 2', description: 'Desc 2', isSystem: true },
    ];

    const mockCodes = [
        { id: 1, groupId: 'G1', codeId: 'C1', codeName: 'Code 1', sortOrder: 1, isActive: true },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (apiCommonCode.getGroups as any).mockResolvedValue({ data: mockGroups });
        (apiCommonCode.getCodesByGroup as any).mockResolvedValue({ data: mockCodes });
    });

    it('should render groups and initial codes', async () => {
        render(<CodeManagement />);
        
        await waitFor(() => {
            expect(screen.getByText('Group 1')).toBeDefined();
            expect(screen.getByText('Group 2')).toBeDefined();
        });

        // Initially selects the first group
        await waitFor(() => {
            expect(screen.getByText('Codes: Group 1')).toBeDefined();
            expect(screen.getByText('Code 1')).toBeDefined();
        });
    });

    it('should switch codes when different group is clicked', async () => {
        render(<CodeManagement />);
        
        await waitFor(() => screen.getByText('Group 2'));
        
        const group2 = screen.getByText('Group 2');
        fireEvent.click(group2);
        
        await waitFor(() => {
            expect(apiCommonCode.getCodesByGroup).toHaveBeenCalledWith('G2');
        });
    });

    it('should show system badge for system groups', async () => {
        render(<CodeManagement />);
        await waitFor(() => screen.getByText('Group 2'));
        expect(screen.getByText('System')).toBeDefined();
    });
});
