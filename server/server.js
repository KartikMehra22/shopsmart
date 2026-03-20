const express = require('express');
const cors    = require('cors');
const app     = express();
const PORT    = 5001;

app.use(cors());
app.use(express.json());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.get('/', (req, res) => res.send('ShopSmart API'));
app.get('/api/health',     (req, res) => res.json({ status: 'ok' }));
app.get('/api/products',   async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});
app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
}

module.exports = app;
