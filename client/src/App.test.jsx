import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the ShopSmart brand', async () => {
    render(<App />);
    expect(screen.getAllByText(/ShopSmart/i).length).toBeGreaterThan(0);
  });

  it('renders the hero headline after the home page loads', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Shop Without Limits/i })).toBeInTheDocument();
    });
  });
});
