const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('../src/server');
const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Comment = require('../src/models/Comment');

dotenv.config();

// Helper for making HTTP requests in Node
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: process.env.PORT || 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runAllTests = async () => {
  console.log('\n======================================================');
  console.log('🚀 CODEALPHA TASK 2: SOCIAL MEDIA PLATFORM VERIFICATION');
  console.log('======================================================\n');

  try {
    // Wait for server to bind
    await new Promise((r) => setTimeout(r, 1500));

    // Clean test data
    console.log('[Test Setup] Cleaning database test collections...');
    await User.deleteMany({
      $or: [
        { email: { $in: ['alex@test.com', 'sarah@test.com', 'mike@test.com'] } },
        { username: { $in: ['alex_dev', 'sarah_tech', 'mike_test'] } },
      ],
    });
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('✅ Database cleaned.\n');

    // 1. Health check
    console.log('--- 1. Testing Health Check Endpoint ---');
    const healthRes = await request('GET', '/api/health');
    if (healthRes.status !== 200) throw new Error(`Health check failed with status ${healthRes.status}`);
    console.log(`✅ Health Check OK: ${JSON.stringify(healthRes.body.status)}`);

    // 2. User Registration
    console.log('\n--- 2. Testing User Registration ---');
    const userAReg = await request('POST', '/api/auth/register', {
      name: 'Alex Rivera',
      username: 'alex_dev',
      email: 'alex@test.com',
      password: 'password123',
    });
    if (userAReg.status !== 201 || !userAReg.body.token) {
      throw new Error(`User A Registration failed: ${JSON.stringify(userAReg.body)}`);
    }
    const tokenA = userAReg.body.token;
    const userA = userAReg.body.user;
    console.log(`✅ User A Registered: @${userA.username} (ID: ${userA._id})`);

    const userBReg = await request('POST', '/api/auth/register', {
      name: 'Sarah Connor',
      username: 'sarah_tech',
      email: 'sarah@test.com',
      password: 'password123',
    });
    if (userBReg.status !== 201 || !userBReg.body.token) {
      throw new Error(`User B Registration failed: ${JSON.stringify(userBReg.body)}`);
    }
    const tokenB = userBReg.body.token;
    const userB = userBReg.body.user;
    console.log(`✅ User B Registered: @${userB.username} (ID: ${userB._id})`);

    // Duplicate check
    const dupReg = await request('POST', '/api/auth/register', {
      name: 'Alex Clone',
      username: 'alex_dev',
      email: 'alex_different@test.com',
      password: 'password123',
    });
    if (dupReg.status === 400) {
      console.log('✅ Duplicate username validation prevented duplicate registration.');
    } else {
      throw new Error('Duplicate username was not prevented!');
    }

    // 3. User Login
    console.log('\n--- 3. Testing User Login ---');
    const loginRes = await request('POST', '/api/auth/login', {
      credential: 'alex_dev',
      password: 'password123',
    });
    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    console.log(`✅ Login Successful with username: @${loginRes.body.user.username}`);

    // 4. Token verification with /api/auth/me
    console.log('\n--- 4. Testing JWT Auth Verification (/api/auth/me) ---');
    const meRes = await request('GET', '/api/auth/me', null, tokenA);
    if (meRes.status !== 200 || meRes.body.user.username !== 'alex_dev') {
      throw new Error(`Get Me endpoint failed: ${JSON.stringify(meRes.body)}`);
    }
    console.log(`✅ /api/auth/me verified for User: ${meRes.body.user.name}`);

    // 5. Update Profile
    console.log('\n--- 5. Testing Profile Update ---');
    const updateRes = await request(
      'PUT',
      '/api/users/profile',
      {
        bio: 'Full Stack Engineer & Open Source Enthusiast 🚀',
        location: 'San Francisco, CA',
        website: 'https://alexrivera.dev',
      },
      tokenA
    );
    if (updateRes.status !== 200 || updateRes.body.user.bio !== 'Full Stack Engineer & Open Source Enthusiast 🚀') {
      throw new Error(`Profile update failed: ${JSON.stringify(updateRes.body)}`);
    }
    console.log(`✅ Profile Updated: Bio="${updateRes.body.user.bio}", Location="${updateRes.body.user.location}"`);

    // Fetch Profile by Username
    const getProfileRes = await request('GET', '/api/users/profile/alex_dev');
    if (getProfileRes.status !== 200 || getProfileRes.body.user.location !== 'San Francisco, CA') {
      throw new Error(`Get profile failed: ${JSON.stringify(getProfileRes.body)}`);
    }
    console.log(`✅ Fetched Public Profile for @alex_dev successfully.`);

    // 6. Create Post
    console.log('\n--- 6. Testing Post Creation ---');
    const postRes = await request(
      'POST',
      '/api/posts',
      {
        content: 'Excited to showcase Task 2 of the CodeAlpha Internship! Full Stack Social Media Platform built with React, Node.js, Express & MongoDB 💻✨',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      },
      tokenA
    );
    if (postRes.status !== 201 || !postRes.body.post._id) {
      throw new Error(`Post creation failed: ${JSON.stringify(postRes.body)}`);
    }
    const createdPost = postRes.body.post;
    console.log(`✅ Post Created: ID=${createdPost._id}, Author=@${createdPost.author.username}`);

    // 7. Likes System
    console.log('\n--- 7. Testing Like / Unlike System ---');
    // User B likes User A's post
    const likeRes = await request('POST', `/api/posts/${createdPost._id}/like`, null, tokenB);
    if (likeRes.status !== 200 || !likeRes.body.isLiked || likeRes.body.likesCount !== 1) {
      throw new Error(`Liking post failed: ${JSON.stringify(likeRes.body)}`);
    }
    console.log(`✅ User B liked User A's post. likesCount=${likeRes.body.likesCount}, isLiked=${likeRes.body.isLiked}`);

    // Verify post in database has User B in likes
    const dbPostLikeCheck = await Post.findById(createdPost._id);
    if (!dbPostLikeCheck.likes.some((id) => id.toString() === userB._id.toString())) {
      throw new Error('Database does not reflect like relation');
    }
    console.log('✅ MongoDB persistence for Like relation confirmed.');

    // 8. Comments System
    console.log('\n--- 8. Testing Comments System ---');
    const commentRes = await request(
      'POST',
      `/api/posts/${createdPost._id}/comments`,
      { content: 'Outstanding work on the architecture! Looks super sleek 🔥' },
      tokenB
    );
    if (commentRes.status !== 201 || !commentRes.body.comment._id) {
      throw new Error(`Comment creation failed: ${JSON.stringify(commentRes.body)}`);
    }
    const createdComment = commentRes.body.comment;
    console.log(`✅ User B commented on post: "${createdComment.content}" (ID: ${createdComment._id})`);

    // Fetch comments for the post
    const getCommentsRes = await request('GET', `/api/posts/${createdPost._id}/comments`);
    if (getCommentsRes.status !== 200 || getCommentsRes.body.count !== 1) {
      throw new Error(`Get comments failed: ${JSON.stringify(getCommentsRes.body)}`);
    }
    console.log(`✅ Fetched ${getCommentsRes.body.count} comments for post.`);

    // 9. Follow / Unfollow System
    console.log('\n--- 9. Testing Follow / Unfollow System ---');
    // User B follows User A
    const followRes = await request('POST', `/api/users/${userA._id}/follow`, null, tokenB);
    if (followRes.status !== 200 || !followRes.body.isFollowing || followRes.body.targetFollowersCount !== 1) {
      throw new Error(`Follow user failed: ${JSON.stringify(followRes.body)}`);
    }
    console.log(`✅ User B followed User A: ${followRes.body.message}, targetFollowers=${followRes.body.targetFollowersCount}`);

    // Verify in MongoDB
    const updatedUserA = await User.findById(userA._id);
    const updatedUserB = await User.findById(userB._id);
    if (
      !updatedUserA.followers.some((id) => id.toString() === userB._id.toString()) ||
      !updatedUserB.following.some((id) => id.toString() === userA._id.toString())
    ) {
      throw new Error('MongoDB does not reflect follow/following relationship');
    }
    console.log('✅ MongoDB persistence for Follow relationship confirmed in User documents.');

    // 10. Following Feed Filter
    console.log('\n--- 10. Testing Personalized Following Feed ---');
    const feedRes = await request('GET', '/api/posts?feedType=following', null, tokenB);
    if (feedRes.status !== 200 || feedRes.body.posts.length === 0) {
      throw new Error(`Following feed retrieval failed: ${JSON.stringify(feedRes.body)}`);
    }
    console.log(`✅ User B's following feed loaded ${feedRes.body.posts.length} posts from followed users.`);

    // 11. Search Users & Suggested Users
    console.log('\n--- 11. Testing User Search & Suggestions ---');
    const searchRes = await request('GET', '/api/users/search?q=alex');
    if (searchRes.status !== 200 || searchRes.body.users.length === 0) {
      throw new Error(`Search users failed: ${JSON.stringify(searchRes.body)}`);
    }
    console.log(`✅ Search for "alex" returned ${searchRes.body.users.length} match: @${searchRes.body.users[0].username}`);

    console.log('\n======================================================');
    console.log('🎉 ALL 11 TEST SUITES PASSED FLAWLESSLY!');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
};

runAllTests();
