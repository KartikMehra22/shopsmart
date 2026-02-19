import { http, HttpResponse } from 'msw'

export const handlers = [
    http.get('*/api/health', () => {
        return HttpResponse.json({
            status: 'UP',
            message: 'Backend is running smoothly (MSW Mock)',
            timestamp: new Date().toISOString()
        })
    }),
]
