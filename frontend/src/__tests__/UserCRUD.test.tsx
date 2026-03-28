import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserList from '../features/user/UserList';
import apiUser from '../api/apiUser';

// Mock the API
vi.mock('../api/apiUser', () => ({
  default: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockUsers = [
  { id: 1, userId: 'jdoe', name: 'John Doe', email: 'john@test.com', role: 'ROLE_USER', isActive: true, companyId: 'SYSTEM' },
  { id: 2, userId: 'admin', name: 'Admin Root', email: 'admin@test.com', role: 'ROLE_ADMIN', isActive: true, companyId: 'SYSTEM' },
];

describe('User Management CRUD UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiUser.list as any).mockResolvedValue(mockUsers);
    
    // Mock localStorage for companyId base
    Storage.prototype.getItem = vi.fn().mockReturnValue('SYSTEM');
  });

  it('조회: should render the user list correctly', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Admin Root')).toBeInTheDocument();
    });
  });

  it('등록: should open modal and trigger user create API', async () => {
    render(<UserList />);
    
    const registerBtn = screen.getByText('+ Register User');
    fireEvent.click(registerBtn);

    expect(screen.getByText('Register New User')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('e.g. jdoe'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'New User' } });

    (apiUser.create as any).mockResolvedValue({ id: 3, userId: 'newuser', name: 'New User' });

    const saveBtn = screen.getByText('Register');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(apiUser.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'newuser',
        name: 'New User'
      }));
    });
  });

  it('삭제: should trigger user delete API', async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    
    render(<UserList />);
    
    await waitFor(() => screen.getByText('John Doe'));
    
    const deleteBtn = screen.getAllByText('🗑️')[0];
    fireEvent.click(deleteBtn);

    expect(apiUser.delete).toHaveBeenCalledWith(1);
  });
});
