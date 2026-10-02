const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const connectDB = require('./config/db');

dotenv.config();

const sampleUsers = [
  {
    name: 'Alex Rivera',
    username: 'alex_dev',
    email: 'alex@codealpha.com',
    password: 'password123',
    bio: 'Full Stack Engineer & Open Source builder 🚀 | React • Node.js • Cloud',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA',
    website: 'https://github.com/alexrivera',
  },
  {
    name: 'Sarah Connor',
    username: 'sarah_tech',
    email: 'sarah@codealpha.com',
    password: 'password123',
    bio: 'UI/UX enthusiast and frontend artisan. Crafting clean web interactions with React & Tailwind 🎨',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    location: 'New York, NY',
    website: 'https://sarahdesigns.io',
  },
  {
    name: 'David Kim',
    username: 'david_cloud',
    email: 'david@codealpha.com',
    password: 'password123',
    bio: 'Backend specialist & Distributed Systems Architect. Node.js, Docker & MongoDB ☁️',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    location: 'Seattle, WA',
    website: 'https://davidkim.dev',
  },
  {
    name: 'Elena Rostova',
    username: 'elena_ai',
    email: 'elena@codealpha.com',
    password: 'password123',
    bio: 'AI researcher & Deep Learning practitioner. Exploring modern LLMs and agentic pipelines 🤖',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&auto=format&fit=crop&q=80',
    location: 'Boston, MA',
    website: 'https://elena-ai.org',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing old records...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    console.log('[Seeder] Creating sample users...');
    const createdUsers = [];
    for (const u of sampleUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    const [alex, sarah, david, elena] = createdUsers;

    // Follow relationships
    alex.following.push(sarah._id, david._id);
    sarah.followers.push(alex._id);
    david.followers.push(alex._id);

    sarah.following.push(alex._id, elena._id);
    alex.followers.push(sarah._id);
    elena.followers.push(sarah._id);

    david.following.push(alex._id);
    alex.followers.push(david._id);

    await alex.save();
    await sarah.save();
    await david.save();
    await elena.save();

    console.log('[Seeder] Creating sample posts...');
    const post1 = await Post.create({
      author: alex._id,
      content: '🚀 Excited to share Task 2 of my CodeAlpha Full Stack Internship: Social Media Platform! Built with React, Express, Node.js and MongoDB with real-time likes, nested comments, and follow relationships.',
      mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
      likes: [sarah._id, david._id],
      commentsCount: 2,
    });

    const post2 = await Post.create({
      author: sarah._id,
      content: 'Just finished redesigning our design tokens in Tailwind CSS. Crisp typography and sleek micro-interactions really elevate the entire developer experience ✨ What are your favorite UI libraries right now?',
      mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
      likes: [alex._id, elena._id],
      commentsCount: 1,
    });

    const post3 = await Post.create({
      author: david._id,
      content: 'Tip for MongoDB users: Always index fields used in high-frequency queries like username, email, and reference ObjectIds. Performance gains on large datasets are phenomenal ⚡️',
      likes: [alex._id],
      commentsCount: 0,
    });

    const post4 = await Post.create({
      author: elena._id,
      content: 'Exploring agentic AI architectures and multi-agent systems today. The synergy between reasoning models and code execution tools is evolving so fast!',
      mediaUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&auto=format&fit=crop&q=80',
      likes: [sarah._id, david._id, alex._id],
      commentsCount: 1,
    });

    console.log('[Seeder] Creating sample comments...');
    await Comment.create({
      post: post1._id,
      author: sarah._id,
      content: 'Super clean architecture Alex! Love the modern UI aesthetics and responsiveness 👏',
    });

    await Comment.create({
      post: post1._id,
      author: david._id,
      content: 'Rock-solid backend implementation. The REST endpoints and MongoDB schemas are very well structured.',
    });

    await Comment.create({
      post: post2._id,
      author: alex._id,
      content: 'Tailwind + Lucide icons is definitely the ultimate developer stack!',
    });

    await Comment.create({
      post: post4._id,
      author: alex._id,
      content: 'Fascinating topic! Can you recommend any good research papers on agent workflows?',
    });

    console.log('✅ [Seeder] Database seeded successfully with users, posts, comments, likes & follows!\n');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]:', err.message);
    process.exit(1);
  }
};

seedDatabase();
