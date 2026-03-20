const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: 'Wireless ANC Headphones',
      price: 189.0,
      tag: 'Best Seller',
      category: 'Audio',
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80&fit=crop',
    },
    {
      name: 'Mechanical Keyboard 75%',
      price: 159.0,
      tag: 'Limited Drop',
      category: 'Workspace',
      image:
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80&fit=crop',
    },
    {
      name: 'USB-C Hub 7-in-1',
      price: 59.0,
      tag: null,
      category: 'Workspace',
      image:
        'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&q=80&fit=crop',
    },
    {
      name: 'Architect Desk Lamp',
      price: 89.0,
      tag: 'New Season',
      category: 'Workspace',
      image:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&fit=crop',
    },
    {
      name: '4K Webcam Ultra',
      price: 119.0,
      tag: "Editor's Pick",
      category: 'Video',
      image:
        'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=80&fit=crop',
    },
    {
      name: 'Mouse Pad XL Leather',
      price: 34.0,
      tag: null,
      category: 'Workspace',
      image:
        'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&fit=crop',
    },
    {
      name: 'Portable SSD 1TB',
      price: 99.0,
      tag: 'Best Seller',
      category: 'Storage',
      image:
        'https://images.unsplash.com/photo-1542382257-80dee8172da7?w=600&q=80&fit=crop',
    },
    {
      name: 'Minimal Laptop Stand',
      price: 49.0,
      tag: 'New Season',
      category: 'Workspace',
      image:
        'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=600&q=80&fit=crop',
    },
  ];

  const categories = [
    {
      name: 'Workspace',
      count: 5,
      image:
        'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=600&q=80&fit=crop',
    },
    {
      name: 'Audio',
      count: 1,
      image:
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80&fit=crop',
    },
    {
      name: 'Video',
      count: 1,
      image:
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80&fit=crop',
    },
    {
      name: 'Storage',
      count: 1,
      image:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop',
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  for (const c of categories) {
    await prisma.category.create({ data: c });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
