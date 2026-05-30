# Docker Setup

Run EmPay HRMS with Docker Compose. This starts PostgreSQL, the Express API, and the React frontend.

## Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose v2

## Start the App

Optionally copy the example environment file before starting:

```bash
cp .env.example .env
```

Docker Compose also works without this file because `docker-compose.yml` includes local-development defaults.

```bash
docker compose up --build
```

Open the frontend:

```text
http://localhost:5173
```

The backend API is available at:

```text
http://localhost:5000/api/health
```

The PostgreSQL container is exposed on `localhost:5433` to avoid conflicts with local PostgreSQL installations that commonly use port `5432`.

## Demo Login

```text
Email: admin@empay.com
Password: Password@123
```

## Seed Full Demo Data

The backend automatically creates tables and seeds demo users on first startup. To add dashboard data such as attendance and payroll records, run:

```bash
docker compose exec backend node seed-demo-data.js
```

## Environment

Default Docker values are defined in `docker-compose.yml`. Copy `.env.example` to `.env` if you want to customize ports, database credentials, JWT settings, or frontend API URLs.

The default PostgreSQL credentials are only for local development:

```text
Database: empay_db
User: postgres
Password: postgres
Host port: 5433
```

## Useful Commands

```bash
# Start in the background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Stop and remove database/upload volumes
docker compose down -v
```
