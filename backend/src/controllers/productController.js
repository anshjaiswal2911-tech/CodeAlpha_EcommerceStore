import Product from '../models/Product.js';
import User from '../models/User.js';

// Curated seed data for initial store setup
const sampleProducts = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'Premium active noise cancelling over-ear headphones with 30-hour battery life and crystal clear audio fidelity.',
    category: 'Electronics',
    price: 199.99,
    countInStock: 12,
  },
  {
    name: 'Minimalist Mechanical Keyboard',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    description: 'Compact 75% layout mechanical keyboard with hot-swappable switches, RGB backlighting, and durable PBT keycaps.',
    category: 'Electronics',
    price: 89.50,
    countInStock: 8,
  },
  {
    name: 'Ergonomic Wireless Mouse',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    description: 'Precision wireless mouse sculpted for all-day comfort, multi-device Bluetooth pairing, and rechargeable battery.',
    category: 'Electronics',
    price: 49.99,
    countInStock: 20,
  },
  {
    name: 'Stainless Steel Insulated Water Bottle',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    description: 'Double-wall vacuum insulated 750ml bottle keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof lid.',
    category: 'Lifestyle',
    price: 24.99,
    countInStock: 25,
  },
  {
    name: 'Canvas Commuter Backpack',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    description: 'Water-resistant vintage canvas backpack with dedicated padded 15.6-inch laptop compartment and leather accents.',
    category: 'Accessories',
    price: 59.99,
    countInStock: 15,
  },
  {
    name: 'Smart Fitness Tracker Watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: 'Waterproof smartwatch featuring 24/7 heart rate monitoring, sleep analysis, SpO2 sensor, and 14-day battery.',
    category: 'Electronics',
    price: 79.99,
    countInStock: 10,
  },
  {
    name: 'Ceramic Pour-Over Coffee Maker',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    description: 'Artisan matte ceramic dripper set with reusable stainless steel mesh filter for brewing rich specialty coffee.',
    category: 'Home & Kitchen',
    price: 34.99,
    countInStock: 18,
  },
  {
    name: 'Ultra-Soft Organic Cotton Hoodie',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    description: 'Heavyweight brushed organic cotton hoodie with reinforced ribbed cuffs, front kangaroo pocket, and relaxed fit.',
    category: 'Clothing',
    price: 45.00,
    countInStock: 14,
  },
];

/**
 * @desc    Fetch all products with optional keyword and category filtering
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { keyword, category } = req.query;

    const query = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    let products = await Product.find(query).sort({ createdAt: -1 });

    // If database is empty, auto-seed with sample products
    if (products.length === 0 && !keyword && (!category || category === 'All')) {
      let adminUser = await User.findOne({ isAdmin: true });
      if (!adminUser) {
        adminUser = await User.findOne();
      }

      if (!adminUser) {
        adminUser = await User.create({
          name: 'Store Admin',
          email: 'admin@store.com',
          password: 'adminPassword123',
          isAdmin: true,
        });
      }

      const productsWithUser = sampleProducts.map((p) => ({
        ...p,
        user: adminUser._id,
      }));
      await Product.insertMany(productsWithUser);
      products = await Product.find({}).sort({ createdAt: -1 });
    }

    res.status(200).json({
      status: 'success',
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found - Invalid product ID format',
      });
    }

    const product = await Product.findById(id);

    if (product) {
      res.status(200).json({
        status: 'success',
        data: product,
      });
    } else {
      res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed initial sample products
 * @route   POST /api/products/seed
 * @access  Public
 */
export const seedProducts = async (req, res, next) => {
  try {
    let adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      adminUser = await User.findOne();
    }

    if (!adminUser) {
      adminUser = await User.create({
        name: 'Store Admin',
        email: 'admin@store.com',
        password: 'adminPassword123',
        isAdmin: true,
      });
    }

    await Product.deleteMany({});

    const productsWithUser = sampleProducts.map((p) => ({
      ...p,
      user: adminUser._id,
    }));

    const created = await Product.insertMany(productsWithUser);

    res.status(201).json({
      status: 'success',
      message: `Seeded ${created.length} products successfully`,
      data: created,
    });
  } catch (error) {
    next(error);
  }
};
