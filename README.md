# 🏪 StoreRate — Store Rating Web Application

A full-stack, production-grade web application built with **React.js**, **Express.js**, and **PostgreSQL**. The platform provides distinct experiences for three user roles: **System Administrators**, **Normal Users (Customers)**, and **Store Owners**.

---

## 🚀 Key Features by User Role

### 👑 1. System Administrator (`SYSTEM_ADMIN`)
- **Real-Time Analytics Dashboard**: Live totals for registered users, active stores, and submitted ratings aggregated in a single database round-trip.
- **User Management**:
  - View all registered users with server-side allowlisted sorting, debounced multi-field searching, and scalable pagination.
  - Create new accounts with explicit role assignment (`NORMAL_USER`, `STORE_OWNER`, `SYSTEM_ADMIN`).
  - User Details Inspector modal with dedicated rating summaries for store owners.
- **Store Management**:
  - View registered stores with live calculated average ratings and reviewer counts.
  - Create stores and dynamically assign verified `STORE_OWNER` accounts.
  - Filter stores by Name, Email, and Address, and sort by Rating or Name.
- **Account Management**: In-place secure password change modal and session logout.

### 🛍️ 2. Normal User / Customer (`NORMAL_USER`)
- **Self-Registration**: Public signup with strict validation rules (Name: 20–60 chars, Address: max 400 chars, Password: 8–16 chars with uppercase & special char).
- **Store Catalog**: Responsive card grid displaying Store Name, Location, Overall Rating (`★★★★☆ 4.3 / 5.0`), and personal rating status.
- **Debounced Search & Sorting**: Real-time 300ms debounced search by Store Name and Address; sort by Highest/Lowest Rating, Name, or Address.
- **Interactive 1–5 Star Rating Engine**:
  - **State A (Unrated)**: Displays `"Not Rated Yet"` badge with `"⭐ Rate This Store"` trigger.
  - **State B (Rated)**: Displays `"You rated: ★★★★☆ (4 / 5)"` badge with `"✏️ Modify Rating"` trigger.
  - Full keyboard accessibility (<kbd>Arrow Left</kbd> / <kbd>Right</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>) and radio group semantics.
- **Profile Security**: Secure password change modal and session logout.

### 🏬 3. Store Owner (`STORE_OWNER`)
- **Dedicated Store Dashboard**: Overview of assigned business profile (Name, Location, Verified Email).
- **Live Rating Analytics**: Large average score counter with visual star rating and 5-star customer satisfaction rate.
- **Visual Rating Distribution**: Animated 1–5 star progress tracks showing review counts and percentage shares.
- **Customer Reviewers Table**: Detailed table listing Customer Name (with initialed avatar badges), Email, Address, Submitted Star Rating, and Timestamps.
- **Search, Sorting & Pagination**: Search reviews by Customer Name or Email; sort by Rating, Date, Name, or Email.
- **Security & Profile**: In-place secure password change modal and session logout.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Vanilla CSS Design System (Outfit & Inter fonts) |
| **Backend** | Node.js (v18+), Express.js (ES Modules), Helmet, Morgan, Express-Rate-Limit |
| **Database** | PostgreSQL (v14+), Connection Pooling (`pg`), DB Triggers, Indexes & Views |
| **Authentication** | JWT (Explicit `HS256` validation), Bcrypt.js (12 salt rounds) |
| **Observability** | `/health` Live Database Probe, `X-Request-Id` Distributed Tracing, Graceful Shutdown |
| **Testing & CI/CD** | Node.js Native Test Runner (`node:test`, `node:assert/strict`), Supertest, GitHub Actions |

---

## 📁 Project Structure

```
Roxiler/
├── .github/
│   └── workflows/
│       └── ci.yml                      # GitHub Actions CI pipeline (Node 18/20 matrix)
├── backend/
│   ├── app.js                          # Express app configuration & middleware
│   ├── server.js                       # Server entry point, DB test connection & graceful shutdown
│   ├── package.json                    # Backend dependencies & npm scripts
│   ├── .env.example                    # Environment variable template
│   ├── src/
│   │   ├── config/                     # Environment schema & validation (env.js)
│   │   ├── constants/                  # ROLES, PAGINATION, RATING_LIMITS constants
│   │   ├── controllers/                # Request handlers (auth, admin, users, stores, ratings)
│   │   ├── database/                   # PG connection pool, migrate runner, seed script
│   │   │   └── migrations/             # 001_initial.sql, 002_performance_indexes.sql
│   │   ├── middleware/                 # authenticate, authorize, rateLimiter, error, validation
│   │   ├── models/                     # Parameterized SQL models (user, store, rating)
│   │   ├── routes/v1/                  # Express REST routes
│   │   ├── services/                   # Business logic layer
│   │   ├── utils/                      # AppError, pagination, jwt, response helpers
│   │   └── validators/                 # Express-validator schema chains
│   └── tests/                          # 52 Automated test cases across 7 suites
│       ├── auth.test.js                # Login, registration, password update tests
│       ├── health.test.js              # Health probe & correlation ID tests
│       ├── users.test.js               # User management & admin authorization tests
│       ├── stores.test.js              # Store browsing, filtering & creation tests
│       ├── ratings.test.js             # 1-5 star constraints & trigger tests
│       ├── owner.test.js               # Store owner analytics & cross-role tests
│       ├── security.test.js            # Red-team adversarial penetration tests
│       └── helpers.js                  # Token generation & mock query router
│
└── frontend/
    ├── index.html                      # HTML entry with Google Fonts (Outfit, Inter)
    ├── vite.config.js                  # Vite dev proxy configuration
    ├── package.json                    # Frontend dependencies & npm scripts
    ├── .env.example                    # Environment variable template
    └── src/
        ├── api/                        # Centralized Axios services (axios, auth, admin, stores, ratings, users)
        ├── components/common/          # Button, Input, Modal, Navbar, StarRating, ProtectedRoute, ErrorBoundary, ChangePasswordModal
        ├── context/                    # AuthContext (JWT storage & session management)
        ├── hooks/                      # useAuth, useDebounce
        ├── pages/
        │   ├── admin/                  # AdminDashboard, UserManagement, StoreManagement
        │   ├── auth/                   # Login, Register
        │   ├── owner/                  # OwnerDashboard
        │   ├── user/                   # UserDashboard
        │   └── NotFound.jsx            # 404 page
        ├── utils/                      # constants, validators
        ├── index.css                   # Global responsive design tokens & component styles
        └── main.jsx                    # React root render
```

---

## ⚙️ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **npm** or **yarn**

---

### 2. Monorepo Quick Setup

From the repository root:

```bash
# 1. Install all dependencies across root, backend, and frontend
npm run install:all

# 2. Run Database Migrations
npm --prefix backend run migrate

# 3. Seed Demo Data (1 User per Role + 3 Sample Stores)
npm --prefix backend run seed

# 4. Start both Backend (Port 5000) and Frontend (Port 5173) concurrently
npm run dev
```

---

### 3. Demo Credentials

| Role | Email | Password | Pre-configured Data |
|---|---|---|---|
| **`SYSTEM_ADMIN`** | `admin@storerate.dev` | `Admin@1234` | Platform Overview, User Management, Store Management |
| **`STORE_OWNER`** | `owner@storerate.dev` | `Owner@1234` | Manages 3 sample stores with customer rating breakdown |
| **`NORMAL_USER`** | `user@storerate.dev` | `User@1234` | Active ratings submitted across sample stores |

> *Interactive pill buttons on the Login page allow instant one-click autofill for each demo account.*

---

## 🧪 Automated Testing Suite (52 Tests)

The test suite covers unit logic, integration routes, database constraints, and red-team penetration vectors:

```bash
npm --prefix backend test
```

### Test Suite Summary:
```
✔ AUTH SUITE: /api/v1/auth (8 tests)
✔ HEALTH & OBSERVABILITY SUITE (2 tests)
✔ STORE OWNER SUITE: /api/v1/stores/my-store (6 tests)
✔ RATINGS SUITE: /api/v1/ratings (6 tests)
✔ RED TEAM SECURITY SUITE: Penetration & Abuse Testing (12 tests)
✔ STORES SUITE: /api/v1/stores (5 tests)
✔ USERS & ADMIN AUTHORIZATION SUITE: /api/v1/users (6 tests)

# total tests 52
# pass 52 (100%)
# fail 0
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` or `/api/health` | Public | Live readiness probe & database health check |
| `POST` | `/api/v1/auth/register` | Public | Register a new `NORMAL_USER` |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile |
| `PATCH` | `/api/v1/auth/change-password` | Authenticated | Update user password with validation |
| `GET` | `/api/v1/admin/stats` | `SYSTEM_ADMIN` | Real-time platform statistics |
| `GET` | `/api/v1/users` | `SYSTEM_ADMIN` | Paginated user list with search & sorting |
| `POST` | `/api/v1/users` | `SYSTEM_ADMIN` | Create account with role assignment |
| `GET` | `/api/v1/users/:id` | `SYSTEM_ADMIN` | Inspect user details and store owner stats |
| `DELETE` | `/api/v1/users/:id` | `SYSTEM_ADMIN` | Delete user account |
| `GET` | `/api/v1/stores` | Authenticated | Browse stores with calculated average & personal rating |
| `POST` | `/api/v1/stores` | `SYSTEM_ADMIN` | Create store & assign store owner |
| `GET` | `/api/v1/stores/:id` | Authenticated | Retrieve single store details |
| `GET` | `/api/v1/stores/my-store` | `STORE_OWNER` | Retrieve owner's assigned store |
| `GET` | `/api/v1/stores/my-store/stats` | `STORE_OWNER` | 1–5 star rating distribution & metrics |
| `GET` | `/api/v1/stores/my-store/ratings` | `STORE_OWNER` | Paginated customer reviewers list with search & sort |
| `POST` | `/api/v1/ratings` | `NORMAL_USER` | Submit 1–5 star rating for a store |
| `PUT` | `/api/v1/ratings/:storeId` | `NORMAL_USER` | Modify existing rating |
| `GET` | `/api/v1/ratings/store/:storeId` | Authenticated | Get public reviews for a specific store |

---

## 🚢 Production Deployment Guide

### A. Environment Configuration

#### Backend Production `.env`:
```ini
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host.internal
DB_PORT=5432
DB_NAME=store_rating_prod
DB_USER=app_user
DB_PASSWORD=strong_production_password
DB_SSL=true
JWT_SECRET=64_character_hex_random_generated_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=https://storerate.yourdomain.com
TRUST_PROXY=true
```

#### Frontend Production `.env`:
```ini
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

---

### B. Deployment Steps

#### 1. Database Provisioning & Migration
```bash
# Apply production schema & indexes
NODE_ENV=production npm --prefix backend run migrate
```

#### 2. Frontend Production Build
```bash
npm --prefix frontend run build
# Deploy 'frontend/dist' to static hosting (Vercel, Netlify, Cloudflare Pages, S3/CloudFront)
```

#### 3. Backend Production Start
```bash
NODE_ENV=production npm --prefix backend start
```

---

## 📋 Pre-Flight Release Checklist

- [x] **Automated Tests**: 52/52 tests passing (`npm --prefix backend test`).
- [x] **Production Build**: Vite builds with 0 errors (`npm --prefix frontend run build`).
- [x] **Secrets Hygiene**: Verified `.gitignore` prevents tracking `.env` files.
- [x] **Dependency Audit**: 0 vulnerabilities on root and backend (`npm audit`).
- [x] **Database Constraints**: `CHECK` constraints, triggers, and foreign keys active.
- [x] **Security Headers & CORS**: Helmet and origin allowlists configured.
- [x] **Health Check Endpoint**: `/health` verifies database connectivity.
- [x] **Graceful Shutdown**: `SIGTERM` / `SIGINT` cleanly drains pool.

---

## 📄 License
Developed for internship assessment. Distributed under the ISC License.