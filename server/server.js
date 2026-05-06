const express = require('express');
const cors = require('cors');
const app = express();
const PORT = Number(process.env.PORT) || 5001;

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (allowedOrigins.length > 0) {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );
}

app.use(express.json());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});
app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

// Parity routes (baseline implementations)
app.get('/api/users', (req, res) =>
  res.json({ message: 'Users endpoint (Mock)' })
);
app.get('/api/cart', (req, res) => res.json({ items: [], total: 0 }));
app.get('/api/orders', (req, res) => res.json({ orders: [] }));
app.get('/api/reviews', (req, res) => res.json({ reviews: [] }));
app.get('/api/admin', (req, res) =>
  res.status(403).json({ error: 'Unauthorized' })
);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () =>
    console.log(`Backend running at http://localhost:${PORT}`)
  );
}

module.exports = app;
