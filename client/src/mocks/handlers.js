import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        category: 'Test',
        image: '',
      },
    ]);
  }),
  http.get('/api/categories', () => {
    return HttpResponse.json([
      { id: 1, name: 'Test Category', count: 1, image: '' },
    ]);
  }),
];
