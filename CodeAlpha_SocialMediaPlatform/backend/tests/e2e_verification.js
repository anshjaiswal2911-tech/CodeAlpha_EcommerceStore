const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Comment = require('../src/models/Comment');

dotenv.config();

const req = (port, path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
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

    const clientReq = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    clientReq.on('error', (e) => reject(e));
    if (postData) clientReq.write(postData);
    clientReq.end();
  });
};

const runE2E = async () => {
  console.log('\n=============================================================');
  console.log('🔍 CODEALPHA TASK 2: END-TO-END SYSTEM VERIFICATION');
  console.log('=============================================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codealpha_social_db');

    // 1. Verify Frontend & Backend Availability
    console.log('[Step 1] Checking Frontend & Backend Server Availability...');
    const feRes = await req(5173, '/');
    if (feRes.status !== 200) throw new Error('Frontend server did not return 200');
    console.log('   ✅ Frontend is serving HTTP 200 at http://127.0.0.1:5173');

    const beHealth = await req(5001, '/api/health');
    if (beHealth.status !== 200 || beHealth.data.status !== 'ok') throw new Error('Backend health check failed');
    console.log('   ✅ Backend is healthy at http://127.0.0.1:5001/api/health');

    // 2. Register New User
    console.log('\n[Step 2] Testing User Registration...');
    const testUsername = `user_${Date.now().toString().slice(-4)}`;
    const testEmail = `${testUsername}@test.com`;
    const regRes = await req(5001, '/api/auth/register', 'POST', {
      name: 'Verification Candidate',
      username: testUsername,
      email: testEmail,
      password: 'StrongPassword123!',
    });
    if (regRes.status !== 201 || !regRes.data.token) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    const token = regRes.data.token;
    const userId = regRes.data.user._id;
    console.log(`   ✅ User registered successfully: @${testUsername} (Token received)`);

    // Verify User in MongoDB
    const userInDb = await User.findById(userId);
    if (!userInDb || userInDb.email !== testEmail) throw new Error('User not found in MongoDB!');
    console.log(`   ✅ MongoDB persistence confirmed for User: ${userInDb.name}`);

    // 3. Login & Logout Token Validation
    console.log('\n[Step 3] Testing Login / User Sessions...');
    const loginRes = await req(5001, '/api/auth/login', 'POST', {
      credential: testUsername,
      password: 'StrongPassword123!',
    });
    if (loginRes.status !== 200 || !loginRes.data.token) throw new Error('Login failed');
    console.log(`   ✅ User logged in successfully. User session verified.`);

    const meRes = await req(5001, '/api/auth/me', 'GET', null, loginRes.data.token);
    if (meRes.status !== 200 || meRes.data.user.username !== testUsername) throw new Error('Protected /me failed');
    console.log(`   ✅ Authenticated endpoint /api/auth/me returned profile for @${meRes.data.user.username}`);

    // 4. View & Edit User Profile
    console.log('\n[Step 4] Testing View & Edit User Profile...');
    const updateRes = await req(5001, '/api/users/profile', 'PUT', {
      bio: 'Verified CodeAlpha Candidate 🎓',
      location: 'Bangalore, India',
      website: 'https://codealpha.io',
    }, token);
    if (updateRes.status !== 200 || updateRes.data.user.bio !== 'Verified CodeAlpha Candidate 🎓') throw new Error('Profile update failed');
    console.log(`   ✅ Profile updated: Bio="${updateRes.data.user.bio}", Location="${updateRes.data.user.location}"`);

    const viewProf = await req(5001, `/api/users/profile/${testUsername}`);
    if (viewProf.status !== 200 || viewProf.data.user.website !== 'https://codealpha.io') throw new Error('View profile failed');
    console.log(`   ✅ Public profile fetched: @${viewProf.data.user.username} (${viewProf.data.user.followersCount} followers, ${viewProf.data.user.postsCount} posts)`);

    // 5. Create a Post
    console.log('\n[Step 5] Testing Post Creation...');
    const createPostRes = await req(5001, '/api/posts', 'POST', {
      content: 'Hello World from the newly registered CodeAlpha account! 🚀 Tested live on React + Node.js + MongoDB.',
      mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    }, token);
    if (createPostRes.status !== 201 || !createPostRes.data.post._id) throw new Error('Create post failed');
    const postId = createPostRes.data.post._id;
    console.log(`   ✅ Post created: ID=${postId}`);

    // Verify Post in MongoDB
    const postInDb = await Post.findById(postId);
    if (!postInDb || postInDb.content.indexOf('Hello World') === -1) throw new Error('Post not persisted in MongoDB!');
    console.log(`   ✅ MongoDB persistence confirmed for Post.`);

    // 6. View Posts / Feed
    console.log('\n[Step 6] Testing Feed Retrieval...');
    const feedRes = await req(5001, '/api/posts?feedType=explore');
    if (feedRes.status !== 200 || !Array.isArray(feedRes.data.posts) || feedRes.data.posts.length === 0) throw new Error('Feed empty or failed');
    console.log(`   ✅ Feed retrieved: ${feedRes.data.posts.length} posts found.`);

    // 7. Like / Unlike a Post
    console.log('\n[Step 7] Testing Like / Unlike System...');
    const likeRes = await req(5001, `/api/posts/${postId}/like`, 'POST', null, token);
    if (likeRes.status !== 200 || !likeRes.data.isLiked || likeRes.data.likesCount !== 1) throw new Error('Liking post failed');
    console.log(`   ✅ Post liked: likesCount=${likeRes.data.likesCount}, isLiked=${likeRes.data.isLiked}`);

    // Verify Like in MongoDB
    const postWithLike = await Post.findById(postId);
    if (!postWithLike.likes.some((id) => id.toString() === userId.toString())) throw new Error('Like not persisted in MongoDB!');
    console.log('   ✅ MongoDB persistence confirmed for Post Like array.');

    const unlikeRes = await req(5001, `/api/posts/${postId}/like`, 'POST', null, token);
    if (unlikeRes.status !== 200 || unlikeRes.data.isLiked || unlikeRes.data.likesCount !== 0) throw new Error('Unliking post failed');
    console.log(`   ✅ Post unliked: likesCount=${unlikeRes.data.likesCount}, isLiked=${unlikeRes.data.isLiked}`);

    // 8. Add a Comment
    console.log('\n[Step 8] Testing Comments System...');
    const commentRes = await req(5001, `/api/posts/${postId}/comments`, 'POST', {
      content: 'This is an end-to-end verified comment on the newly created post!',
    }, token);
    if (commentRes.status !== 201 || !commentRes.data.comment._id) throw new Error('Adding comment failed');
    const commentId = commentRes.data.comment._id;
    console.log(`   ✅ Comment added: "${commentRes.data.comment.content}" (ID: ${commentId})`);

    // Verify Comment in MongoDB
    const commentInDb = await Comment.findById(commentId);
    if (!commentInDb) throw new Error('Comment not persisted in MongoDB!');
    console.log('   ✅ MongoDB persistence confirmed for Comment document.');

    // 9. Follow / Unfollow Another User
    console.log('\n[Step 9] Testing Follow / Unfollow System...');
    const alexUser = await User.findOne({ username: 'alex_dev' });
    if (!alexUser) throw new Error('Seeded user @alex_dev not found');

    const followRes = await req(5001, `/api/users/${alexUser._id}/follow`, 'POST', null, token);
    if (followRes.status !== 200 || !followRes.data.isFollowing) throw new Error('Follow failed');
    console.log(`   ✅ User followed @alex_dev: isFollowing=${followRes.data.isFollowing}`);

    // Verify Follow in MongoDB
    const checkTargetUser = await User.findById(alexUser._id);
    const checkCurrentUser = await User.findById(userId);
    if (
      !checkTargetUser.followers.some((id) => id.toString() === userId.toString()) ||
      !checkCurrentUser.following.some((id) => id.toString() === alexUser._id.toString())
    ) {
      throw new Error('Follow relationship not persisted in MongoDB!');
    }
    console.log('   ✅ MongoDB persistence confirmed for bidirectional follow relations.');

    const unfollowRes = await req(5001, `/api/users/${alexUser._id}/follow`, 'POST', null, token);
    if (unfollowRes.status !== 200 || unfollowRes.data.isFollowing) throw new Error('Unfollow failed');
    console.log(`   ✅ User unfollowed @alex_dev: isFollowing=${unfollowRes.data.isFollowing}`);

    console.log('\n=============================================================');
    console.log('🎉 ALL END-TO-END VERIFICATION CHECKS PASSED WITH ZERO ERRORS!');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E VERIFICATION FAILED:', err.message);
    process.exit(1);
  }
};

runE2E();
