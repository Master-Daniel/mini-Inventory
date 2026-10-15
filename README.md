# Mini Inventory and Orders Service

A complete full-stack application for managing product inventory and customer orders, featuring a NestJS REST API, PostgreSQL database with TypeORM, Role-Based Access Control (RBAC), a React + TypeScript frontend, and a standalone Golang analytics microservice.

---

## Architecture Overview

```
                          ┌──────────────────────────┐
                          │   React + Vite Frontend  │
                          │      (Port 5173)         │
                          └─────────────┬────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
    ┌──────────────────────────────┐       ┌──────────────────────────────┐
    │     NestJS REST API          │       │  Golang Analytics Service    │
    │        (Port 3000)           │       │        (Port 8080)           │
    └───────────────┬──────────────┘       └───────────────┬──────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
                           ┌──────────────────────────┐
                           │    PostgreSQL Database   │
                           │       (Port 5432)        │
                           └──────────────────────────┘
```

The system comprises three independent services:
1. **NestJS Backend (`backend/`)**: Provides REST endpoints for Auth, Product CRUD, and Order Management. Enforces pessimistic locking and SQL database transactions during order placement to prevent inventory over-drafting.
2. **React Frontend (`frontend/`)**: Modern UI built with Vite, TypeScript, and Tailwind CSS. Supports customer catalog browsing, interactive cart, order checkout, order history tracking, admin product management, and an analytics dashboard.
3. **Golang Analytics Service (`analytics-service/`)**: Standalone microservice in Go that ingests inventory and order data to compute total revenue, order count, average order value, low stock alerts, and top-selling products.

---

## Features & Highlights

- **Authentication & RBAC**: JWT authentication with two distinct roles:
  - `admin`: Full product management (Add, Edit, Delete), order status tracking/updates, and analytics overview.
  - `customer`: Browse product catalog, add items to cart, place orders, and view personal order history.
- **Transactional Stock Deduction**: Pessimistic write locking on row-level items prevents concurrency race conditions during stock deduction.
- **Input Validation & Error Handling**: NestJS `ValidationPipe` with `class-validator` DTOs ensures strict request parsing.
- **Golang Microservice Bonus**: Isolated report calculation service exposed on `/reports/summary`.

---

## Getting Started & Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- Go (v1.22+)
- PostgreSQL (v14+) running locally on port `5432` with user `postgres` and password `postgres`.

---

### Database Setup
1. Ensure PostgreSQL service is running:
   ```bash
   sudo service postgresql start
   ```
2. Create the target database `inventory_db`:
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE inventory_db;"
   ```

---

### Backend Service (`backend/`)

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Seed database with initial Admin (`admin@example.com` / `admin123`) & Customer (`customer@example.com` / `customer123`) accounts and sample products:
   ```bash
   npm run seed
   ```

3. Run unit test suite:
   ```bash
   npm test
   ```

4. Start backend API server:
   ```bash
   npm run start:dev
   # Server listens on http://localhost:3000
   ```

---

### Golang Analytics Service (`analytics-service/`)

1. Run unit tests:
   ```bash
   cd analytics-service
   go test -v ./...
   ```

2. Start microservice:
   ```bash
   go run main.go
   # Microservice listens on http://localhost:8080
   ```

---

### Frontend Service (`frontend/`)

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Build production assets / verify TypeScript compilation:
   ```bash
   npm run build
   ```

3. Start development server:
   ```bash
   npm run dev
   # Access application at http://localhost:5173
   ```

---

## Seed Account Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` |
| **Customer** | `customer@example.com` | `customer123` |

---

## API Endpoints Summary

### Auth (`/auth`)
- `POST /auth/register` - Create new customer or admin account.
- `POST /auth/login` - Authenticate user and receive JWT bearer token.
- `GET /auth/me` - Get current authenticated user profile.

### Products (`/products`)
- `GET /products` - Public catalog list.
- `GET /products/:id` - Fetch product details.
- `POST /products` - Admin create product.
- `PUT /products/:id` - Admin update product details or stock.
- `DELETE /products/:id` - Admin remove product.

### Orders (`/orders`)
- `POST /orders` - Customer place order (validates and deducts stock transactionally).
- `GET /orders/my-orders` - Customer view order history.
- `GET /orders` - Admin view all customer orders.
- `PATCH /orders/:id/status` - Admin update order status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).

### Analytics (`/reports/summary`)
- `GET /reports/summary` - Golang microservice summary metrics.

---

## Assumptions & Design Trade-offs

1. **Database Synchronize Mode**: Schema auto-synchronization (`synchronize: true`) is used in `TypeOrmModule` for rapid demo setup. In production, explicit TypeORM migration scripts would be executed.
2. **Pessimistic Write Locking**: Chosen over optimistic concurrency control for order creation to strictly guarantee zero inventory over-drafting when multiple users attempt to purchase scarce stock simultaneously.
3. **Microservice Analytics Integration**: The Go microservice directly queries the NestJS REST endpoints to aggregate product and order states, decoupling database connection logic while preserving isolated service boundaries.
