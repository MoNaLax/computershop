# ⚡ IHAVEGPU — Computer Hardware Store

A full-stack e-commerce web application for buying and selling computer hardware components. Built with **Vanilla HTML/CSS/JavaScript** frontend, **Node.js + Express** backend, **PostgreSQL** database, and containerized with **Docker Compose**. Features include product browsing, shopping cart, order management, and admin panel for product CRUD operations.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 16 Alpine |
| **Web Server** | Nginx Alpine |
| **Containerization** | Docker, Docker Compose |
| **Session Management** | In-memory (Map) / localStorage |

---

## ✨ Key Features

### 🛍️ Customer Features
- **Homepage** — Eye-catching hero section, category overview, featured products
- **Product Catalog** — Browse 18+ computer hardware products across 9 categories
  - 🔍 **Real-time Search** — Find products by name, brand, description
  - 🏷️ **Category Filter** — CPU, GPU, Motherboard, RAM, Storage, PSU, Cooling, Cases, Monitor
  - ↕️ **Smart Sort** — Sort by price, name, date added, or default
  - 💰 **Price Range Filter** — Min/max price filtering
- **Product Details** — Full specifications, images, brand info
- **Shopping Cart** — Persistent localStorage cart
  - Add/remove items
  - Quantity adjustment with stock validation
  - Real-time total calculation
  - Slide-in cart sidebar
- **Checkout** — Process orders with automatic stock reduction
- **Order Tracking** — View order history and status
- **About Page** — Company information

### 👨‍💼 Admin Features
- **Admin Panel** (`/pages/admin.html`) — Secure admin interface with session auth
  - View all products in table format
  - **Create** new products with specs (JSONB)
  - **Update** product details, pricing, stock
  - **Delete** products from catalog
  - Real-time product statistics
- **Authentication** — Simple login with credentials
  - Session tokens with 24-hour expiry
  - Session verification

### 🎨 User Experience
- **Responsive Design** — Mobile, tablet, desktop optimized
- **Toast Notifications** — Real-time feedback for actions
- **Modern UI** — CSS variables, smooth animations
- **Font Awesome Icons** — Professional icon library

---

## 📁 Project Structure

```
computer-shop-main/
├── docker-compose.yml          # Service orchestration (PostgreSQL, Node.js, Nginx)
├── nginx.conf                  # Reverse proxy & static file serving config
├── README.md                   # This file
│
├── backend/
│   ├── Dockerfile              # Node.js app containerization
│   ├── package.json            # Dependencies: express, pg, cors, dotenv
│   ├── server.js               # Express app entry point + routes setup
│   │
│   ├── db/
│   │   ├── pool.js             # PostgreSQL connection pool
│   │   └── init.sql            # Database schema + seed data (18 products)
│   │
│   └── routes/
│       ├── auth.js             # POST /api/auth/login, /api/auth/verify
│       ├── products.js         # GET /api/products, GET /api/products/:id, POST/PUT/DELETE
│       ├── categories.js       # GET /api/categories (with product count)
│       └── cart.js             # POST /api/cart/checkout (with transaction)
│
└── frontend/
    ├── index.html              # Homepage
    ├── css/
    │   ├── style.css           # Main styles (variables, responsive)
    │   ├── admin.css           # Admin panel styles
    │   └── login.css           # Auth styles
    │
    ├── js/
    │   ├── app.js              # Frontend logic (API calls, cart, notifications)
    │   ├── admin.js            # Admin panel functionality
    │   └── login.js            # Authentication logic
    │
    └── pages/
        ├── products.html       # Product listing & filtering page
        ├── about.html          # About/company info page
        ├── login.html          # Admin login page
        └── admin.html          # Admin panel for product CRUD
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (v24+) — [Download](https://www.docker.com/products/docker-desktop/)
- **Git** — [Download](https://git-scm.com/)

Verify installation:
```bash
docker --version        # Docker 24+
docker compose version  # Docker Compose 2+
```

### Step 1 — Clone & Navigate

```bash
git clone https://github.com/Nattasak-Chonmanat/computer-shop.git
cd computer-shop-main
```

### Step 2 — Start All Services

```bash
docker compose up --build
```

This will:
1. Build Node.js backend image
2. Pull PostgreSQL 16-alpine and Nginx images
3. Create and initialize database (auto-runs `init.sql`)
4. Start all 3 containers (db, backend, frontend)
5. Seed 18 computer hardware products across 9 categories

**First build: 1-2 minutes**

### Step 3 — Access the App

| Service | URL | Credentials |
|---|---|---|
| 🌐 **Website** | http://localhost:8080 | — |
| 🔐 **Admin Panel** | http://localhost:8080/pages/admin.html | `Admin` / `123456` |
| 🔧 **Backend API** | http://localhost:3000/api/health | — |
| 🗄️ **Database** | localhost:5432 | `MoNaLax` / `102549` |

### Step 4 — Verify Services

```bash
# Check container status
docker compose ps

# Should show:
# computer_shop_db        running
# computer_shop_backend   running
# computer_shop_frontend  running

# Test backend health
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"..."}

# Test products endpoint
curl http://localhost:3000/api/products
# [{ product objects... }]
```

---

## 🔄 Development Workflow

### 🎨 Frontend Changes (HTML/CSS/JS)
No rebuild needed — changes reflect instantly:
```bash
# Just save your file and refresh browser
```

### 🔧 Backend Changes (Node.js)
Restart backend container:
```bash
docker compose restart backend
# Or rebuild:
docker compose up --build backend
```

### 🗄️ Database Schema Changes
Schema is auto-initialized from `init.sql`. To re-run:
```bash
docker compose down -v          # Remove volume
docker compose up --build       # Fresh database
```

---

## 🛑 Container Management

```bash
# Stop containers (preserve data)
docker compose stop

# Stop and remove containers (preserve volume)
docker compose down

# Full cleanup (delete database data)
docker compose down -v

# View logs
docker compose logs -f                    # All services
docker compose logs -f backend            # Backend only
docker compose logs -f db                 # Database only
```

---

## 📡 API Reference

### 🔐 Authentication

| Method | Endpoint | Description | Body |
|---|---|---|---|
| POST | `/api/auth/login` | Admin login | `{ "username": "Admin", "password": "123456" }` |
| POST | `/api/auth/verify` | Verify session token | `{ "token": "..." }` |

**Response (login):**
```json
{
  "success": true,
  "token": "abc123...",
  "username": "Admin"
}
```

---

### 📦 Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products with filters |
| GET | `/api/products/:id` | Get single product by ID |
| POST | `/api/products` | Create new product *(admin)* |
| PUT | `/api/products/:id` | Update product *(admin)* |
| DELETE | `/api/products/:id` | Delete product *(admin)* |

**Query Parameters for GET `/api/products`:**

| Param | Type | Example | Notes |
|---|---|---|---|
| `category` | string | `gpu` | Filter by category slug |
| `search` | string | `rtx 4090` | Search in name, description, brand |
| `min_price` | number | `5000` | Minimum price |
| `max_price` | number | `30000` | Maximum price |
| `sort` | string | `price` | Sort field: `id`, `price`, `name`, `created_at` |
| `order` | string | `DESC` | Sort direction: `ASC` or `DESC` |

**Example Requests:**
```bash
# Get all GPU products
curl "http://localhost:3000/api/products?category=gpu"

# Search and sort by price
curl "http://localhost:3000/api/products?search=nvidia&sort=price&order=ASC"

# Filter by price range
curl "http://localhost:3000/api/products?min_price=10000&max_price=50000"

# Get product by ID
curl "http://localhost:3000/api/products/1"
```

**Response (GET /api/products):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "AMD Ryzen 9 7950X",
      "price": "52990",
      "stock": 15,
      "brand": "AMD",
      "category_name": "CPU & Processors",
      "image_url": "https://images.unsplash.com/...",
      "specs": {
        "cores": 16,
        "threads": 32,
        "base_clock": "4.5 GHz"
      },
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 18
}
```

---

### 🏷️ Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List all categories with product count |

**Response:**
```json
[
  {
    "id": 1,
    "name": "CPU & Processors",
    "slug": "cpu",
    "icon": null,
    "order": 1,
    "product_count": 3
  },
  {
    "id": 3,
    "name": "Graphics Cards",
    "slug": "gpu",
    "icon": null,
    "order": 3,
    "product_count": 3
  }
]
```

---

### 🛒 Cart & Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/cart/checkout` | Submit order with stock reduction |

**Request Body:**
```json
{
  "session_id": "guest_12345",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 52990
    },
    {
      "product_id": 4,
      "quantity": 1,
      "price": 62990
    }
  ]
}
```

**Response (success):**
```json
{
  "order_id": 42,
  "session_id": "guest_12345",
  "total": 168970,
  "status": "pending",
  "created_at": "2024-01-15T14:22:00Z",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 52990
    }
  ]
}
```

**Error Responses:**
```json
// Insufficient stock
{
  "error": "\"AMD Ryzen 9 7950X\" เหลือแค่ 5 ชิ้น"
}

// Product not found
{
  "error": "Product ID 999 not found"
}

// Empty cart
{
  "error": "Cart is empty"
}
```

---

## 🗄️ Database Schema

### Tables

```sql
categories
├── id (PRIMARY KEY)
├── name
├── slug (UNIQUE)
├── icon
└── order

products
├── id (PRIMARY KEY)
├── name
├── description
├── price (NUMERIC)
├── stock (INTEGER)
├── category_id (FOREIGN KEY → categories)
├── image_url
├── brand
├── specs (JSONB)
└── created_at

orders
├── id (PRIMARY KEY)
├── session_id
├── total (NUMERIC)
├── status ('pending' | 'confirmed' | 'cancelled')
└── created_at

order_items
├── id (PRIMARY KEY)
├── order_id (FOREIGN KEY → orders)
├── product_id (FOREIGN KEY → products)
├── quantity (INTEGER)
└── price (NUMERIC)
```

### Database Connection

**Host:** `db` (in Docker) / `localhost` (local)  
**Port:** `5432`  
**Database:** `computer_shop`  
**User:** `MoNaLax`  
**Password:** `102549`

---

## 🔌 GUI Database Clients (Optional)

Connect with **pgAdmin**, **TablePlus**, **DBeaver**, or **DataGrip**:

```
Host:     localhost
Port:     5432
Database: computer_shop
User:     MoNaLax
Password: 102549
```

---

## 🐛 Troubleshooting

### Backend won't connect to database
The backend may start before PostgreSQL is fully ready. Solution:
```bash
# Restart backend container
docker compose restart backend

# Or check logs
docker compose logs backend
```

### Port already in use
```bash
# Find what's using the port
lsof -i :8080
lsof -i :3000
lsof -i :5432

# Change ports in docker-compose.yml:
# ports:
#   - "8181:80"     # frontend on 8181 instead of 8080
#   - "3001:3000"   # backend on 3001
```

### Frontend shows "Failed to load products"
```bash
# Check backend is running and healthy
docker compose ps
curl http://localhost:3000/api/health

# Check browser console for CORS errors
# Verify Nginx is correctly proxying /api/ requests
docker compose logs frontend
```

### Cart data lost after refresh
This is normal — cart is stored in localStorage. However, it persists if:
- Cookie/localStorage is not cleared
- Browser session is still active

To test persistence:
1. Add item to cart
2. Refresh page
3. Cart should still have items

### Admin login not working
Default credentials:
- **Username:** `Admin`
- **Password:** `123456`

If session fails, check backend logs:
```bash
docker compose logs backend | grep -i auth
```

### Permission errors on Linux/Mac
```bash
chmod -R 755 ./frontend ./backend ./db
docker compose up --build
```

### Want to clear all data and start fresh?
```bash
docker compose down -v        # Remove volumes (-v flag)
docker compose up --build     # Fresh database
```

---

## 🔐 Environment Variables

Default configuration in `docker-compose.yml`:

```yaml
Backend:
  DB_HOST: db
  DB_PORT: 5432
  DB_USER: MoNaLax
  DB_PASSWORD: 102549
  DB_NAME: computer_shop
  PORT: 3000

Database:
  POSTGRES_USER: MoNaLax
  POSTGRES_PASSWORD: 102549
  POSTGRES_DB: computer_shop
```

To customize, edit `docker-compose.yml` and ensure **both** backend and database values match.

---

## 💡 Development Notes

- **Cart State:** Stored in browser `localStorage` — persists across page refreshes
- **Product Images:** Using Unsplash URLs (requires internet connection)
- **Product Specs:** Stored as PostgreSQL `JSONB` for flexible attributes
- **Admin Sessions:** In-memory Map with 24-hour expiry (suitable for single-admin setup; use Redis/database for production)
- **Stock Management:** Uses PostgreSQL transactions (`BEGIN/COMMIT/ROLLBACK`) to prevent overselling
- **API Proxying:** Nginx configured to proxy all `/api/` requests to backend container
- **Database Initialization:** Auto-runs `init.sql` on first container creation — subsequent runs need `down -v`

---

## 🛒 Products Included

The database seeds with 18 high-end computer components:

| Category | Products | Examples |
|---|---|---|
| CPU & Processors | 3 | AMD Ryzen 9 7950X, Intel Core i9-14900K, AMD Ryzen 5 7600X |
| Graphics Cards | 3 | NVIDIA RTX 4090, RTX 4070 Ti Super, AMD Radeon RX 7800 XT |
| Memory (RAM) | 2 | Corsair Dominator Titanium 32GB, G.Skill Trident Z5 64GB |
| Storage | 2 | Samsung 990 Pro 2TB, WD Black SN850X 1TB |
| Motherboards | 2 | ASUS ROG Maximus Z790, MSI MEG X670E |
| Power Supplies | 2 | Corsair RM1000x 1000W, be quiet! Dark Power 850W |
| Cooling | 2 | Noctua NH-D15 G2, NZXT Kraken Elite 360 |
| Cases | 2 | Lian Li PC-O11 Dynamic EVO, Fractal Design Torrent |

---

## 🎯 Common Tasks

### Add a new product programmatically
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ASUS ProArt RTX 4080",
    "price": 24990,
    "stock": 10,
    "brand": "ASUS",
    "category_id": 3,
    "image_url": "https://...",
    "specs": {"vram": "16GB", "tdp": "320W"}
  }'
```

### Check order history
```bash
docker exec computer_shop_db psql -U MoNaLax -d computer_shop -c \
  "SELECT * FROM orders;"
```

### Reset product stock
```bash
docker exec computer_shop_db psql -U MoNaLax -d computer_shop -c \
  "UPDATE products SET stock = 50;"
```

### Monitor real-time logs
```bash
docker compose logs -f --tail=50    # Last 50 lines, all services
docker compose logs -f backend      # Backend only
docker compose logs -f db           # Database only
```

---

## 📝 Notes for Production

This project is designed for **learning and demonstration**. For production deployment:

1. **Authentication** — Replace in-memory sessions with JWT + database
2. **Environment Variables** — Use `.env` file, never commit credentials
3. **Database** — Use managed PostgreSQL (AWS RDS, Railway, Vercel Postgres)
4. **Admin Panel** — Add proper role-based access control (RBAC)
5. **API Security** — Add rate limiting, input validation, SQL injection prevention
6. **Frontend** — Build optimization, minification, CDN for static assets
7. **HTTPS** — Enable SSL/TLS certificates (Let's Encrypt, Cloudflare)
8. **Monitoring** — Add logging, error tracking (Sentry), performance monitoring

---

## 📄 License

MIT License — Free to use, modify, and distribute for personal and commercial projects.

See LICENSE file for details.
