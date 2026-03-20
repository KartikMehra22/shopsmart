import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the ShopSmart logo', () => {
    render(<App />);
    const logoElements = screen.getAllByText(/SHOPSMART/i);
    expect(logoElements.length).toBeGreaterThan(0);
  });

  it('renders the hero headline', () => {
    render(<App />);
    const headline = screen.getByText(/Craft your/i);
    expect(headline).toBeDefined();
  });
});
