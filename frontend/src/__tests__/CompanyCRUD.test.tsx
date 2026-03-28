import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CompanyList from '../features/company/CompanyList';
import apiCompany from '../api/apiCompany';

// Mock the API
vi.mock('../api/apiCompany', () => ({
  default: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockCompanies = [
  { id: 1, companyId: 'COMP-001', name: 'Test Company 1', status: 'ACTIVE' },
  { id: 2, companyId: 'COMP-002', name: 'Test Company 2', status: 'INACTIVE' },
];

describe('Company Management CRUD UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiCompany.list as any).mockResolvedValue(mockCompanies);
  });

  it('조회: should render the company list correctly', async () => {
    render(<CompanyList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Company 1')).toBeInTheDocument();
      expect(screen.getByText('Test Company 2')).toBeInTheDocument();
    });
  });

  it('등록: should open modal and trigger create API', async () => {
    render(<CompanyList />);
    
    const registerBtn = screen.getByText('+ Register Company');
    fireEvent.click(registerBtn);

    expect(screen.getByText('Register New Company')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('Business Name');
    const idInput = screen.getByPlaceholderText('e.g. COMP-001');
    
    fireEvent.change(nameInput, { target: { value: 'New Company' } });
    fireEvent.change(idInput, { target: { value: 'COMP-NEW' } });

    const saveBtn = screen.getByText('Register');
    (apiCompany.create as any).mockResolvedValue({ id: 3, name: 'New Company', companyId: 'COMP-NEW' });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(apiCompany.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Company',
        companyId: 'COMP-NEW'
      }));
    });
  });

  it('삭제: should trigger delete API on button click', async () => {
    // Mock confirm
    window.confirm = vi.fn().mockReturnValue(true);
    
    render(<CompanyList />);
    
    await waitFor(() => screen.getByText('Test Company 1'));
    
    // Select by the emoji content which acts as the name
    const deleteBtn = screen.getAllByText('🗑️')[0];

    
    fireEvent.click(deleteBtn);

    expect(apiCompany.delete).toHaveBeenCalledWith(1);
  });
});
