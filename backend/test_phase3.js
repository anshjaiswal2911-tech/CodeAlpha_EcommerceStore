import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';

const TEST_PORT = 5097;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runPhase3Tests() {
  console.log('=== STARTING PHASE 3 (PRODUCTS & ORDERS) INTEGRATION TESTS ===\n');

  await connectDB();
  const server = app.listen(TEST_PORT, '127.0.0.1');

  try {
    // 1. Seed & Test Product Catalog
    console.log('1. Testing GET /api/products...');
    const productsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/products',
      method: 'GET',
    });
    console.log(`Products Status: ${productsRes.status}, Total Products: ${productsRes.body.count}`);
    if (productsRes.status !== 200 || !productsRes.body.data || productsRes.body.data.length === 0) {
      throw new Error('Product catalog retrieval/seeding failed');
    }
    const sampleProduct = productsRes.body.data[0];
    console.log(`✅ Retrieved ${productsRes.body.data.length} products. Sample: "${sampleProduct.name}" ($${sampleProduct.price})\n`);

    // 2. Test Get Product by ID
    console.log(`2. Testing GET /api/products/${sampleProduct._id}...`);
    const singleProductRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/products/${sampleProduct._id}`,
      method: 'GET',
    });
    console.log(`Single Product Status: ${singleProductRes.status}`);
    if (singleProductRes.status !== 200 || singleProductRes.body.data._id !== sampleProduct._id) {
      throw new Error('Single product lookup failed');
    }
    console.log('✅ Single product lookup verified.\n');

    // 3. Register user for order testing
    console.log('3. Registering test user for order processing...');
    const testEmail = `order_test_${Date.now()}@example.com`;
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Order Test Customer',
      email: testEmail,
      password: 'customerPass123',
    });
    const token = regRes.body.data.token;
    const userId = regRes.body.data._id;
    console.log(`✅ Test customer created (${testEmail})\n`);

    // 4. Test Create Order without token (expect 401)
    console.log('4. Testing POST /api/orders without token (Unauthorized check)...');
    const unauthOrderRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { orderItems: [] });
    console.log(`Response Status: ${unauthOrderRes.status}`);
    if (unauthOrderRes.status !== 401) {
      throw new Error(`Expected 401, got ${unauthOrderRes.status}`);
    }
    console.log('✅ Unauthenticated order creation blocked with 401.\n');

    // 5. Test Create Order with token
    console.log('5. Testing POST /api/orders with token...');
    const initialStock = sampleProduct.countInStock;
    const orderPayload = {
      orderItems: [
        {
          name: sampleProduct.name,
          qty: 2,
          image: sampleProduct.image,
          price: sampleProduct.price,
          product: sampleProduct._id,
        },
      ],
      shippingAddress: {
        address: '456 Market St',
        city: 'San Francisco',
        postalCode: '94103',
        country: 'USA',
      },
      paymentMethod: 'Cash on Delivery',
      itemsPrice: sampleProduct.price * 2,
      taxPrice: (sampleProduct.price * 2 * 0.1).toFixed(2),
      shippingPrice: 10.00,
      totalPrice: (sampleProduct.price * 2 + sampleProduct.price * 2 * 0.1 + 10).toFixed(2),
    };

    const createOrderRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }, orderPayload);

    console.log(`Create Order Status: ${createOrderRes.status}`);
    if (createOrderRes.status !== 201 || !createOrderRes.body.data._id) {
      throw new Error(`Order creation failed: ${JSON.stringify(createOrderRes.body)}`);
    }
    const createdOrderId = createOrderRes.body.data._id;
    console.log(`✅ Order created successfully with ID: ${createdOrderId}`);

    // Verify stock was reduced
    const updatedProduct = await Product.findById(sampleProduct._id);
    if (updatedProduct.countInStock !== initialStock - 2) {
      throw new Error(`Stock was not updated correctly! Expected ${initialStock - 2}, got ${updatedProduct.countInStock}`);
    }
    console.log(`✅ Inventory stock correctly decremented from ${initialStock} to ${updatedProduct.countInStock}\n`);

    // 6. Test Get My Orders
    console.log('6. Testing GET /api/orders/myorders...');
    const myOrdersRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/orders/myorders',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(`My Orders Status: ${myOrdersRes.status}, Orders Count: ${myOrdersRes.body.count}`);
    if (myOrdersRes.status !== 200 || myOrdersRes.body.count !== 1) {
      throw new Error(`Expected 1 order in history, got ${myOrdersRes.body.count}`);
    }
    console.log('✅ Authenticated order history retrieved successfully.\n');

    // 7. Test Get Order by ID
    console.log(`7. Testing GET /api/orders/${createdOrderId}...`);
    const getOrderRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/orders/${createdOrderId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(`Get Order Status: ${getOrderRes.status}`);
    if (getOrderRes.status !== 200 || getOrderRes.body.data._id !== createdOrderId) {
      throw new Error('Order lookup by ID failed');
    }
    console.log(`✅ Order details retrieved for: ${getOrderRes.body.data.user.name} (${getOrderRes.body.data.user.email})\n`);

    // Cleanup
    await Order.deleteOne({ _id: createdOrderId });
    await User.deleteOne({ _id: userId });
    // Restore stock
    await Product.updateOne({ _id: sampleProduct._id }, { $set: { countInStock: initialStock } });
    console.log('🧹 Cleaned up test order & customer data');

    console.log('\n🎉 ALL PHASE 3 BACKEND API TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
    process.exit(0);
  }
}

runPhase3Tests().catch((err) => {
  console.error('❌ Phase 3 Tests failed:', err);
  process.exit(1);
});
