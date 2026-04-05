import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';
import { AuthProvider } from '../features/auth/AuthProvider';

describe('App', () => {
  it('renders correctly', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/ITSM Platform/i)).toBeInTheDocument();
  });
});
