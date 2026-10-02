import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import generateToken from './src/utils/generateToken.js';
import jwt from 'jsonwebtoken';

dotenv.config();

async function runTests() {
  console.log('--- STARTING PHASE 2 AUTOMATED TESTS ---');

  // 1. Test MongoDB connection
  console.log('\n1. Testing MongoDB connection...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected successfully to:', mongoose.connection.name);

  // 2. Test User Model & Password Hashing
  console.log('\n2. Testing User Model creation & bcrypt hashing...');
  const testEmail = `testuser_${Date.now()}@example.com`;
  const rawPassword = 'secretPassword123';

  const user = await User.create({
    name: 'Test Intern',
    email: testEmail,
    password: rawPassword,
    isAdmin: false
  });

  if (!user._id) throw new Error('User creation failed');
  if (user.password === rawPassword) throw new Error('Password was NOT hashed by pre-save hook!');
  console.log('✅ User created with hashed password:', user.password.substring(0, 15) + '...');

  // 3. Test matchPassword method
  console.log('\n3. Testing matchPassword method...');
  const isCorrect = await user.matchPassword(rawPassword);
  const isWrong = await user.matchPassword('wrongPassword');
  if (!isCorrect || isWrong) throw new Error('Password verification logic failed');
  console.log('✅ matchPassword verified correct password and rejected wrong password');

  // 4. Test JWT Generation & verification
  console.log('\n4. Testing JWT generation...');
  const token = generateToken(user._id);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.id !== user._id.toString()) throw new Error('JWT token payload mismatch');
  console.log('✅ JWT generated and verified for user ID:', decoded.id);

  // 5. Test Product Model Schema Validation
  console.log('\n5. Testing Product Model schema validation...');
  const product = new Product({
    user: user._id,
    name: 'Test Headphones',
    image: '/images/sample.jpg',
    description: 'High quality sound',
    category: 'Electronics',
    price: 99.99,
    countInStock: 15
  });
  await product.validate();
  console.log('✅ Product model schema validated successfully');

  // 6. Test Order Model Schema Validation
  console.log('\n6. Testing Order Model schema validation...');
  const order = new Order({
    user: user._id,
    orderItems: [{
      name: 'Test Headphones',
      qty: 1,
      image: '/images/sample.jpg',
      price: 99.99,
      product: product._id
    }],
    shippingAddress: {
      address: '123 Tech Lane',
      city: 'Silicon Valley',
      postalCode: '94025',
      country: 'USA'
    },
    paymentMethod: 'PayPal',
    itemsPrice: 99.99,
    taxPrice: 10.00,
    shippingPrice: 5.00,
    totalPrice: 114.99
  });
  await order.validate();
  console.log('✅ Order model schema validated successfully');

  // Cleanup test user
  await User.deleteOne({ _id: user._id });
  console.log('\n🧹 Test artifacts cleaned up from DB');

  await mongoose.disconnect();
  console.log('\n🎉 ALL UNIT & SCHEMA TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
