const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sample Product Data
const products = [
  {
    id: 1,
    name: 'Ultra-Comfort Wireless Headphones',
    price: 199.99,
    description: 'Noise-canceling headphones with 40-hour battery life.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    name: 'Minimalist Smart Watch',
    price: 149.50,
    description: 'Stleek design with heart rate monitoring and GPS.',
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    name: 'Ergonomic Mechanical Keyboard',
    price: 129.00,
    description: 'RGB backlit mechanical keyboard with tactile switches.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    name: 'Leather Messenger Bag',
    price: 85.00,
    description: 'Handcrafted genuine leather bag for 15-inch laptops.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 5,
    name: 'Portable SSD 1TB',
    price: 110.00,
    description: 'High-speed external storage with USB-C connectivity.',
    category: 'Storage',
    image: 'https://images.unsplash.com/photo-1542382257-80dee8172da7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 6,
    name: 'Smart Home Speaker',
    price: 59.99,
    description: 'Voice-controlled smart assistant with premium sound.',
    category: 'Home Audio',
    image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=400&q=80'
  }
];

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ShopSmart Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Products Route
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Root Route
app.get('/', (req, res) => {
  res.send('ShopSmart Backend Service - Product API');
});

module.exports = app;
