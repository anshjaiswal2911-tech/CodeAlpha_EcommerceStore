# CodeAlpha Simple E-commerce Store (Task 1)

This project is built for **Task 1** of the **CodeAlpha Full Stack Development Internship**. It provides a full-stack e-commerce web application architecture featuring a React + Vite frontend styled with Tailwind CSS, and a Node.js + Express.js backend with RESTful API design.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM ready)
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: Decoupled Client-Server REST API

---

## 📁 Project Structure

```
CodeAlpha_EcommerceStore/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & third-party configuration
│   │   ├── controllers/     # Route business logic handlers
│   │   ├── middleware/      # Authentication & error handling
│   │   ├── models/          # Mongoose data schemas (User, Product, Order)
│   │   ├── routes/          # REST route declarations
│   │   │   └── health.js    # Health check endpoint
│   │   ├── app.js           # Express app instance and middleware setup
│   │   └── server.js        # Server entry point
│   ├── .env.example         # Backend environment variables template
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets & icons
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context state management
│   │   ├── pages/           # Page views
│   │   ├── services/        # API integration services
│   │   ├── App.jsx          # Root application component
│   │   ├── index.css        # Tailwind CSS entry point
│   │   └── main.jsx         # React DOM entry point
│   ├── .env.example         # Frontend environment variables template
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The server runs by default on `http://localhost:5002` with the health check available at `http://localhost:5002/api/health`.*

---

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend runs by default on `http://localhost:5173`.*

---

## 📡 API Endpoints

### Health & Monitoring
| Method | Endpoint | Description | Access | Status |
|---|---|---|---|---|
| `GET` | `/api/health` | Server status and uptime health check | Public | ✅ Active |

### Authentication & Users
| Method | Endpoint | Description | Access | Status |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & return JWT token | Public | ✅ Active |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public | ✅ Active |
| `GET` | `/api/auth/profile` | Get current user profile | Private (Bearer Token) | ✅ Active |

### Product Catalog
| Method | Endpoint | Description | Access | Status |
|---|---|---|---|---|
| `GET` | `/api/products` | Fetch all products (supports `keyword` & `category` queries) | Public | ✅ Active |
| `GET` | `/api/products/:id` | Fetch single product by ID | Public | ✅ Active |
| `POST` | `/api/products/seed` | Seed initial curated store products | Public | ✅ Active |

### Orders & Checkout
| Method | Endpoint | Description | Access | Status |
|---|---|---|---|---|
| `POST` | `/api/orders` | Create order & deduct stock for authenticated user | Private (Bearer Token) | ✅ Active |
| `GET` | `/api/orders/myorders` | Retrieve authenticated user's order history | Private (Bearer Token) | ✅ Active |
| `GET` | `/api/orders/:id` | Retrieve specific order details | Private (Bearer Token) | ✅ Active |

---

## 🧪 Testing Backend API

Run automated unit and integration tests covering Authentication, Products, and Orders:
```bash
cd backend
npm test
```
