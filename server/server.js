const express = require('express');
const cors    = require('cors');
const app     = express();
const PORT    = 5001;

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 1, name: 'Wireless ANC Headphones', price: 189.00, tag: 'Best Seller', category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80&fit=crop'
  },
  {
    id: 2, name: 'Mechanical Keyboard 75%', price: 159.00, tag: 'Limited Drop', category: 'Workspace',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80&fit=crop'
  },
  {
    id: 3, name: 'USB-C Hub 7-in-1', price: 59.00, tag: null, category: 'Workspace',
    image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&q=80&fit=crop'
  },
  {
    id: 4, name: 'Architect Desk Lamp', price: 89.00, tag: 'New Season', category: 'Workspace',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&fit=crop'
  },
  {
    id: 5, name: '4K Webcam Ultra', price: 119.00, tag: "Editor's Pick", category: 'Video',
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=80&fit=crop'
  },
  {
    id: 6, name: 'Mouse Pad XL Leather', price: 34.00, tag: null, category: 'Workspace',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&fit=crop'
  },
  {
    id: 7, name: 'Portable SSD 1TB', price: 99.00, tag: 'Best Seller', category: 'Storage',
    image: 'https://images.unsplash.com/photo-1542382257-80dee8172da7?w=600&q=80&fit=crop'
  },
  {
    id: 8, name: 'Minimal Laptop Stand', price: 49.00, tag: 'New Season', category: 'Workspace',
    image: 'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=600&q=80&fit=crop'
  },
];

const categories = [
  { id: 1, name: 'Workspace', count: 5, image: 'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=600&q=80&fit=crop' },
  { id: 2, name: 'Audio',     count: 1, image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80&fit=crop' },
  { id: 3, name: 'Video',     count: 1, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80&fit=crop' },
  { id: 4, name: 'Storage',   count: 1, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop' },
];

app.get('/', (req, res) => res.send('ShopSmart API'));
app.get('/api/health',     (req, res) => res.json({ status: 'ok' }));
app.get('/api/products',   (req, res) => res.json(products));
app.get('/api/categories', (req, res) => res.json(categories));

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
