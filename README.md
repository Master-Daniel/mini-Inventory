# Mini Inventory and Orders Service

A full-stack application for managing product inventory and customer orders. It features a NestJS REST API, configurable MySQL or PostgreSQL database using TypeORM, role-based access control (RBAC), a React + TypeScript frontend, and a standalone Golang analytics microservice.

---

## Architecture Overview

```text
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
                          │  MySQL or PostgreSQL    │
                          │  MySQL: 3306             │
                          │  PostgreSQL: 5432        │
                          └──────────────────────────┘
```

The system comprises three independent services:

1. **NestJS Backend (`backend/`)**: Provides REST endpoints for authentication, product CRUD, and order management. Uses TypeORM to connect to MySQL or PostgreSQL. Order placement uses database transactions and pessimistic locking to prevent inventory over-drafting.

2. **React Frontend (`frontend/`)**: A modern UI built with Vite, TypeScript, and Tailwind CSS. Supports product catalog browsing, an interactive cart, order checkout, order history, admin product management, and an analytics dashboard.

3. **Golang Analytics Service (`analytics-service/`)**: A standalone Go microservice that retrieves inventory and order data to calculate total revenue, order count, average order value, low-stock alerts, and top-selling products.

---

## Features & Highlights

- **Authentication & RBAC**: JWT authentication with two roles:
  - `admin`: Product management, order status updates, and analytics overview.
  - `customer`: Browse products, add items to a cart, place orders, and view personal order history.

- **Configurable Database**: Supports MySQL and PostgreSQL through environment variables and TypeORM.

- **Transactional Stock Deduction**: Uses pessimistic write locking and database transactions to prevent concurrent purchases from overselling available stock.

- **Input Validation & Error Handling**: NestJS `ValidationPipe` and `class-validator` DTOs provide request validation.

- **Golang Analytics Microservice**: Exposes a `/reports/summary` endpoint for inventory and order metrics.

---

## Getting Started

### Prerequisites

Install the following software:

- Node.js v18 or later and npm
- Go v1.22 or later
- MySQL 8+ or PostgreSQL 14+
- Git

Choose either MySQL or PostgreSQL for the NestJS backend. You do not need to install both.

---

## Database Configuration

The backend uses `ConfigModule` and `ConfigService` to load database settings from environment variables.

The database configuration is controlled by the following variables:

| Variable | Description | Default |
|---|---|---|
| `DB_TYPE` | Database engine: `mysql` or `postgres` | `mysql` |
| `DB_HOST` | Database server hostname | `localhost` |
| `DB_PORT` | Database server port | `3306` for MySQL, `5432` for PostgreSQL |
| `DB_USERNAME` | Database username | `root` for MySQL, `postgres` for PostgreSQL |
| `DB_PASSWORD` | Database password | Empty for MySQL, `postgres` for PostgreSQL |
| `DB_NAME` | Database name | `inventory_db` |

**Important:** The default database engine is MySQL. If `DB_TYPE` is not set, the application attempts to connect to MySQL.

### 1. Create the Environment File

From the project root, navigate to the backend:

```bash
cd backend
```

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and configure the database credentials for your environment.

### 2. Configure MySQL

If you want to use MySQL, configure your `backend/.env` file as follows:

```dotenv
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_NAME=inventory_db
```

Replace `your_mysql_password` with the password for your MySQL user.

Create the database if it does not already exist:

```sql
CREATE DATABASE inventory_db;
```

You can execute this command using the MySQL client:

```bash
mysql -u root -p -e "CREATE DATABASE inventory_db;"
```

If your MySQL root account uses socket authentication, connect using:

```bash
sudo mysql -e "CREATE DATABASE inventory_db;"
```

If you use a dedicated database user, ensure it has the necessary privileges on `inventory_db`.

### 3. Configure PostgreSQL

If you prefer PostgreSQL, update `backend/.env`:

```dotenv
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=inventory_db
```

Replace `your_postgres_password` with your PostgreSQL password.

Create the database:

```bash
sudo -u postgres psql -c "CREATE DATABASE inventory_db;"
```

Ensure the configured PostgreSQL user has the necessary permissions to access the database and create or update tables.

### 4. Start the Database Service

For MySQL:

```bash
sudo service mysql start
```

For PostgreSQL:

```bash
sudo service postgresql start
```

Start only the database service you have selected.

---

## Backend Service (`backend/`)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure the Environment

Ensure `backend/.env` exists and contains the correct database configuration.

The application loads environment variables through NestJS `ConfigModule`.

### 3. Seed the Database

Run the seed script to create the initial admin and customer accounts and sample products:

```bash
npm run seed
```

Default seed credentials:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin123` |
| Customer | `customer@example.com` | `customer123` |

These credentials are intended for local development and testing. Change or disable them before deploying to production.

### 4. Run Unit Tests

```bash
npm test
```

### 5. Start the Backend

```bash
npm run start:dev
```

The API will be available at:

http://localhost:3000

---

## Golang Analytics Service (`analytics-service/`)

### 1. Run Unit Tests

```bash
cd analytics-service
go test -v ./...
```

### 2. Start the Microservice

```bash
go run main.go
```

The analytics service will be available at:

http://localhost:8080

The service retrieves inventory and order information through the NestJS API. Ensure the backend is running and that any required API URLs or configuration values in the analytics service are correctly set.

---

## Frontend Service (`frontend/`)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Build the Application

```bash
npm run build
```

### 3. Start the Development Server

```bash
npm run dev
```

The frontend will be available at:

http://localhost:5173

---

## Seed Account Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin123` |
| Customer | `customer@example.com` | `customer123` |

The seed command must be executed successfully before these accounts can be used.

---

## API Endpoints Summary

### Authentication (`/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate and receive a JWT |
| GET | `/auth/me` | Retrieve the authenticated user's profile |

### Products (`/products`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List products |
| GET | `/products/:id` | Retrieve product details |
| POST | `/products` | Create a product (admin) |
| PUT | `/products/:id` | Update a product (admin) |
| DELETE | `/products/:id` | Delete a product (admin) |

### Orders (`/orders`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Place an order with transactional stock deduction |
| GET | `/orders/my-orders` | Retrieve the authenticated customer's order history |
| GET | `/orders` | Retrieve all orders (admin) |
| PATCH | `/orders/:id/status` | Update order status (admin) |

Supported order statuses:

- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

### Analytics (`/reports/summary`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/summary` | Retrieve inventory and order analytics |

---

## Assumptions & Design Trade-offs

1. **Configurable Database Engine**: The backend supports MySQL and PostgreSQL. The `DB_TYPE` environment variable selects the engine, while `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` configure the connection.

2. **Automatic Schema Synchronization**: TypeORM uses `synchronize: true` to automatically synchronize entity definitions with the database schema. This simplifies local development and demo setup. For production, use explicit database migrations and disable synchronization to avoid unintended schema changes or data loss.

3. **Pessimistic Write Locking**: Database-level locking is used during order creation to prevent concurrent transactions from deducting more stock than is available. Confirm that the selected database and transaction implementation support the locking strategy used by the application.

4. **Microservice Analytics Integration**: The Go microservice retrieves data through the NestJS REST API rather than connecting directly to the database. This keeps database access logic within the backend and maintains service boundaries.

5. **Environment-Based Configuration**: Database credentials are stored in `.env` rather than hard-coded in the application. The `.env.example` file documents the required variables without exposing real credentials.

---