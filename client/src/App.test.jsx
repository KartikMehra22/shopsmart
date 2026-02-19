import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
    it('renders ShopSmart title', async () => {
        render(<App />);
        const titleElement = await screen.findByText(/ShopSmart/i);
        expect(titleElement).toBeInTheDocument();

        // Check if mocked data is displayed
        const statusElement = await screen.findByText(/UP/i);
        expect(statusElement).toBeInTheDocument();
        expect(screen.getByText(/Backend is running smoothly \(MSW Mock\)/)).toBeInTheDocument();
    });
});
