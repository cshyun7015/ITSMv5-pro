import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders correctly', () => {
    render(<App />);
    // Check if the main heading from the Vite template is present
    expect(screen.getByText(/Get started/i)).toBeInTheDocument();

  });
});
