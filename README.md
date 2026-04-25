# ⚡ TechCore — Computer Hardware Store

A full-stack e-commerce web application for buying and selling computer components. Built with vanilla HTML/CSS/JS frontend, Node.js/Express backend, PostgreSQL database, all orchestrated with Docker.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 16 |
| Container | Docker + Docker Compose |
| Web Server | Nginx (serving frontend + reverse proxy) |

---

## ✨ Features

- **Homepage** — Hero section, category grid, featured products, stats
- **Products Page** — Full product listing with:
  - 🔍 Real-time search
  - 🏷️ Filter by category (CPU, GPU, RAM, Storage, etc.)
  - ↕️ Sort by price, name, or default
- **Product Detail** — Modal popup with full specs, description, quantity selector
- **Shopping Cart** — Slide-in sidebar with:
  - Add / remove items
  - Quantity adjustment
  - Total calculation
  - Checkout (saves order to database)
- **About Page** — Company story, team, values
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Toast Notifications** — Feedback on cart actions and checkout

---

## 📁 Project Structure

```
computer-shop/
├── docker-compose.yml          # All services definition
├── nginx.conf                  # Nginx reverse proxy config
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js               # Express app entry point
│   ├── db/
│   │   ├── pool.js             # PostgreSQL connection pool
│   │   └── init.sql            # Schema + seed data
│   └── routes/
│       ├── products.js         # GET /api/products, GET /api/products/:id
│       ├── categories.js       # GET /api/categories
│       └── cart.js             # POST /api/cart/checkout
│
└── frontend/
    ├── index.html              # Homepage
    ├── css/
    │   └── style.css           # All styles (CSS variables + responsive)
    ├── js/
    │   └── app.js              # API calls, cart logic, modals, toasts
    └── pages/
        ├── products.html       # Products listing page
        └── about.html          # About page
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed on your machine:

- **Docker Desktop** (v24+) — [Download](https://www.docker.com/products/docker-desktop/)
- **Docker Compose** (included with Docker Desktop)
- **Git** — [Download](https://git-scm.com/)

Verify installation:
```bash
docker --version        # Docker version 24+
docker compose version  # Docker Compose version 2+
```

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Nattasak-Chonmanat/computer-shop.git
cd computer-shop
```

---

### Step 2 — (Optional) Configure Environment Variables

The default values work out of the box. To customize, edit `docker-compose.yml`:

```yaml
backend:
  environment:
    DB_HOST: db
    DB_PORT: 5432
    DB_USER: shopuser        # Change if needed
    DB_PASSWORD: shoppassword # Change if needed
    DB_NAME: computer_shop
    PORT: 3000
```

If you change `DB_USER` or `DB_PASSWORD`, also update the `db` service values to match.

---

### Step 3 — Build and Start All Services

```bash
docker compose up --build
```

This command will:
1. Pull `postgres:16-alpine` and `nginx:alpine` images
2. Build the Node.js backend image
3. Start PostgreSQL and auto-run `backend/db/init.sql` (creates tables + seeds 17 products)
4. Start the backend API server on port `3000`
5. Start Nginx on port `8080` (serves frontend + proxies `/api/` to backend)

First build may take 1-2 minutes.

---

### Step 4 — Open the App

Once all containers are running, open your browser:

| Service | URL |
|---|---|
| 🌐 Website | http://localhost:8080 |
| 🔧 API (health check) | http://localhost:3000/api/health |
| 🗄️ PostgreSQL | `localhost:5432` (user: shopuser, pass: shoppassword) |

---

### Step 5 — Verify Everything is Working

Check container status:
```bash
docker compose ps
```

All three containers should show `running`:
```
NAME                        STATUS
computer_shop_db            running
computer_shop_backend       running
computer_shop_frontend      running
```

Test the API:
```bash
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"..."}

curl http://localhost:3000/api/products | python3 -m json.tool
# Lists all 17 products
```

---

## 🛑 Stopping the App

```bash
# Stop containers (keeps data)
docker compose stop

# Stop and remove containers (keeps database volume)
docker compose down

# Stop, remove containers AND delete database data
docker compose down -v
```

---

## 🔄 Restarting After Changes

### Frontend changes (HTML/CSS/JS):
No rebuild needed — Nginx serves files directly from the `./frontend` folder.
Just save your file and refresh the browser.

### Backend changes (Node.js):
```bash
docker compose restart backend
```

Or for full rebuild:
```bash
docker compose up --build backend
```

### Database schema changes:
The `init.sql` only runs on **first** container creation. To re-run it:
```bash
docker compose down -v          # Delete the volume
docker compose up --build       # Recreate from scratch
```

---

## 📡 API Reference

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products |
| GET | `/api/products?category=gpu` | Filter by category slug |
| GET | `/api/products?search=rtx` | Search by name/brand |
| GET | `/api/products?sort=price&order=ASC` | Sort products |
| GET | `/api/products/:id` | Get single product detail |

**Query parameters for GET `/api/products`:**

| Param | Type | Example | Description |
|---|---|---|---|
| `category` | string | `gpu` | Filter by category slug |
| `search` | string | `rtx 4090` | Search in name, description, brand |
| `min_price` | number | `5000` | Minimum price filter |
| `max_price` | number | `30000` | Maximum price filter |
| `sort` | string | `price` | Sort field: `id`, `price`, `name`, `created_at` |
| `order` | string | `DESC` | Sort direction: `ASC` or `DESC` |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List all categories with product count |

### Cart / Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/cart/checkout` | Submit order, reduce stock |

**POST `/api/cart/checkout` body:**
```json
{
  "session_id": "guest_123",
  "items": [
    { "product_id": 1, "quantity": 2, "price": 52990 },
    { "product_id": 4, "quantity": 1, "price": 62990 }
  ]
}
```

---

## 🗄️ Database Schema

```sql
categories (id, name, slug, icon)
products   (id, name, description, price, stock, category_id, image_url, brand, specs JSONB, created_at)
orders     (id, session_id, total, status, created_at)
order_items(id, order_id, product_id, quantity, price)
```

---

## 🔌 Connecting a Database GUI (Optional)

Use **pgAdmin**, **TablePlus**, or **DBeaver** with these settings:

```
Host:     localhost
Port:     5432
Database: computer_shop
User:     shopuser
Password: shoppassword
```

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Check what's using the port
lsof -i :8080
lsof -i :3000
lsof -i :5432

# Or change the port in docker-compose.yml, e.g.:
# ports:
#   - "8181:80"   # frontend on 8181
```

### Backend can't connect to database
The backend starts before Postgres is fully ready. If you see connection errors:
```bash
docker compose restart backend
```

### Frontend shows "Failed to load products"
Ensure the backend container is running:
```bash
docker compose logs backend
```

### Permission errors on Linux/Mac
```bash
sudo chmod -R 755 ./frontend ./backend
```

### View live logs
```bash
docker compose logs -f           # All services
docker compose logs -f backend   # Backend only
docker compose logs -f db        # Database only
```

---

## 📝 Development Notes

- Cart state is stored in `localStorage` — persists across page refreshes
- Product images use Unsplash URLs (require internet connection)
- The `specs` field in products is stored as PostgreSQL `JSONB` for flexible attributes
- Nginx is configured to proxy all `/api/` requests to the backend container

---

## 📄 License

MIT License — free to use and modify for personal or commercial projects.
