# CodeAlpha Task 2: Full-Stack Social Media Platform

A full-stack, responsive, production-ready **Social Media Platform** built for the **CodeAlpha Full Stack Development Internship (Task 2)**.

---

## 🌟 Features Implemented

1. **User Authentication & Authorization**:
   - Secure Registration & Login using **JWT (JSON Web Tokens)** and **bcryptjs** password hashing.
   - Protected API endpoints & persistent client-side session management.
2. **User Profiles**:
   - Complete profile pages with cover banner, customizable avatars, bio, location, website, and joined date.
   - Live counters for **Followers**, **Following**, and **Total Posts**.
   - Profile editing modal with instant live updates.
   - Tabs for viewing user's published posts and liked posts.
3. **Create and View Posts**:
   - Rich post creation with text content, character counter, and optional image/media preview.
   - Dynamic Feeds:
     - **For You (Global Feed)**: Real-time explore feed of all posts.
     - **Following Feed**: Personalized feed showing only posts from accounts you follow.
   - Detailed Single Post view with nested comments and shareable permalinks.
   - Author-only post deletion with cascade removal of associated comments.
4. **Like System**:
   - Instant like / unlike toggle with optimistic UI updates.
   - Live counter and heart animations.
   - Full persistence in MongoDB preventing duplicate likes per user.
5. **Comments System**:
   - Real-time commenting on any post.
   - Comment author & post author deletion privileges.
   - Live comment counter updates.
6. **Follow / Unfollow System**:
   - Full bidirectional follow relationships stored in MongoDB.
   - Follow / Unfollow buttons with dynamic state toggles across profiles, suggested cards, and explore views.
   - Who-to-follow suggestions widget and full developer search.
7. **Search & Explore**:
   - Fast keyword search across users and post contents.
   - Filter tabs for People and Posts.

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 18
  - Vite
  - Tailwind CSS
  - Lucide React Icons
  - Axios (with Bearer Token Interceptor)
  - React Router DOM v6
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB & Mongoose ODM
  - JSON Web Tokens (`jsonwebtoken`)
  - `bcryptjs`
  - CORS, Morgan, Dotenv
- **Architecture**: Clean RESTful API with modular Controllers, Models, Routes, and Middleware.

---

## 📂 Project Structure

```
CodeAlpha_SocialMediaPlatform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB Connection
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, Login, Me
│   │   │   ├── userController.js   # Profiles, Follow/Unfollow, Suggestions, Search
│   │   │   ├── postController.js   # Feed, Create, Delete, Like toggle
│   │   │   └── commentController.js# Add, List, Delete comments
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT validation & optional auth
│   │   │   └── errorMiddleware.js # Centralized 404 & Error handlers
│   │   ├── models/
│   │   │   ├── User.js            # User schema, password hash pre-save hook
│   │   │   ├── Post.js            # Post schema, likes array, comments count
│   │   │   └── Comment.js         # Comment schema, post & author references
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   └── directCommentRoutes.js
│   │   ├── seed.js                # Database seeder with sample accounts & posts
│   │   └── server.js              # Express App & Server entry point
│   ├── tests/
│   │   └── verify_all_features.js # End-to-End API verification test suite
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CommentSection.jsx
│   │   │   ├── CreatePostCard.jsx
│   │   │   ├── EditProfileModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RightSidebar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── UserAvatar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # User & session state
│   │   │   └── ToastContext.jsx   # Toast notifications
│   │   ├── pages/
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── FeedPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── PostDetailPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/
│   │   │   └── api.js             # Axios API service layer
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── .env
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ installed
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

### 2. Install Dependencies
From the project root:
```bash
npm run install:all
```
*(Or navigate into `backend/` and `frontend/` separately and run `npm install`)*

### 3. Seed Sample Data (Optional but Recommended)
Populate MongoDB with demo users, posts, comments, likes, and followers:
```bash
cd backend
node src/seed.js
```

### 4. Start the Application

#### Start the Backend:
```bash
cd backend
npm run dev
# Backend runs at http://localhost:5001
```

#### Start the Frontend:
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🧪 Automated Testing & Verification

Run the end-to-end automated test suite verifying every single CodeAlpha Task 2 requirement:
```bash
cd backend
npm test
```

The automated test exercises:
- User registration and duplicate checks
- Password hashing and JWT verification
- Profile retrieval & updating
- Post creation & deletion
- Liking & unliking with MongoDB relation checks
- Commenting & comment deletion
- Follow & unfollow relationships
- Personalized following feed vs global explore feed
- User search & discovery

---

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login user & receive JWT | No |
| `GET` | `/api/auth/me` | Get current authenticated user | Yes |
| `GET` | `/api/users/profile/:username` | Get public profile of a user | No |
| `PUT` | `/api/users/profile` | Update current user profile | Yes |
| `POST` | `/api/users/:id/follow` | Toggle follow / unfollow a user | Yes |
| `GET` | `/api/users/suggested` | Get suggested users to follow | No |
| `GET` | `/api/users/search?q=...` | Search users by name/handle | No |
| `GET` | `/api/posts` | Get feed posts (`explore` or `following`) | No / Optional |
| `POST` | `/api/posts` | Create new post | Yes |
| `GET` | `/api/posts/:id` | Get single post with author | No |
| `DELETE` | `/api/posts/:id` | Delete post (author only) | Yes |
| `POST` | `/api/posts/:id/like` | Toggle like / unlike on post | Yes |
| `GET` | `/api/posts/:postId/comments`| Get comments on a post | No |
| `POST` | `/api/posts/:postId/comments`| Add a comment to post | Yes |
| `DELETE` | `/api/comments/:id` | Delete comment (author only) | Yes |

---

## 👤 Demo Credentials
You can log in with any seeded demo account or create your own:
- **Username**: `alex_dev` | **Password**: `password123`
- **Username**: `sarah_tech` | **Password**: `password123`
- **Username**: `david_cloud` | **Password**: `password123`
- **Username**: `elena_ai` | **Password**: `password123`

---

## 📄 License
This project is developed for the **CodeAlpha Full Stack Development Internship**.
All rights reserved.
