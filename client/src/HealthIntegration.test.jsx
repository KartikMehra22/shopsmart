import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { server } from './mocks/server';

describe('Health Check Integration', () => {
    it('shows loading state and then data', async () => {
        // Use delay to ensure loading state is visible
        server.use(
            http.get('*/api/health', async () => {
                await delay(100);
                return HttpResponse.json({
                    status: 'UP',
                    message: 'Integration Test Success',
                    timestamp: new Date().toISOString()
                });
            })
        );

        render(<App />);

        // Check for loading state
        expect(screen.getByText(/Loading backend status.../i)).toBeInTheDocument();

        // Wait for data to load
        await waitFor(() => {
            expect(screen.queryByText(/Loading backend status.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText(/UP/i)).toBeInTheDocument();
        expect(screen.getByText(/Integration Test Success/i)).toBeInTheDocument();
    });

    it('shows error state when API fails', async () => {
        // Mock API failure
        server.use(
            http.get('*/api/health', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        // We need to check console.error because App.jsx only logs errors
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<App />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error fetching health check:',
                expect.any(Error)
            );
        });

        // App still shows loading state if it errors before setting data
        expect(screen.getByText(/Loading backend status.../i)).toBeInTheDocument();

        consoleSpy.mockRestore();
    });
});
