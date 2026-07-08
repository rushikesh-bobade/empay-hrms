# Deployment Guide

This guide walks through deploying EmPay HRMS to **Railway** or **Render**.

---

## Prerequisites

- A [Railway](https://railway.app) or [Render](https://render.com) account
- [Node.js](https://nodejs.org) >= 18.x
- [PostgreSQL](https://postgresql.org) instance (both platforms provide this)
- Git repository with your code pushed to GitHub/GitLab

---

## Environment Variables

Create a `.env` file in `backend/` with the following:

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/empay` |
| `JWT_SECRET` | Secret for JWT signing | (generate a random 64-char string) |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `FRONTEND_URL` | CORS origin | `https://your-frontend.railway.app` |
| `SMTP_HOST` | Mail server host | `smtp.gmail.com` |
| `SMTP_PORT` | Mail server port | `587` |
| `SMTP_USER` | SMTP username | `your@email.com` |
| `SMTP_PASS` | SMTP password | (app password) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | – |
| `CLOUDINARY_API_KEY` | Cloudinary API key | – |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | – |

---

## Railway Deployment

### 1. Create a Railway project

- Click **New Project** → **Deploy from GitHub repo**
- Select your repository

### 2. Add PostgreSQL

- Click **New** → **Database** → **Add PostgreSQL**
- Copy the `DATABASE_URL` from the PostgreSQL plugin dashboard

### 3. Configure environment variables

- Go to your service **Variables**
- Add all variables from the table above
- Set `NODE_ENV=production`
- Paste the `DATABASE_URL` from PostgreSQL

### 4. Build & Start Commands

Railway auto-detects Node.js. Default settings:

- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`

> ⚠️ Ensure `package.json` has `"start": "node src/app.js"` in the backend directory.

### 5. Deploy

- Railway deploys automatically on push to the linked branch
- Monitor logs under **Deploy Logs**

---

## Render Deployment

### 1. Create a Web Service

- Go to **Dashboard** → **New** → **Web Service**
- Connect your GitHub repository

### 2. Configure the service

| Setting | Value |
|---|---|
| **Name** | `empay-hrms-api` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node src/app.js` |
| **Plan** | Free |

### 3. Add PostgreSQL

- Go to **Dashboard** → **New** → **PostgreSQL**
- Copy the **Internal Database URL** from the PostgreSQL dashboard
- Add it as `DATABASE_URL` in your Web Service environment variables

### 4. Set environment variables

- In your Web Service → **Environment** → **Environment Variables**
- Add all variables from the table above
- Make sure `NODE_ENV=production`

### 5. Deploy

- Click **Manual Deploy** → **Deploy latest commit**
- Or enable **Auto-Deploy** for automatic deployments on git push

---

## Frontend Deployment

### Build the frontend

```bash
cd frontend
npm install
npm run build
```

The static files will be in `frontend/dist/`. Serve them via:

- **Railway:** Create a separate Static Site service pointing to `frontend/`
- **Render:** Create a **Static Site** service with **Root Directory** set to `frontend` and **Build Command** `npm install && npm run build`, **Publish Directory** `dist`

Set `VITE_API_URL` environment variable to your backend URL (e.g. `https://empay-hrms-api.onrender.com/api`).

---

## Database Migrations

On first deploy, tables are created automatically when the server starts (`initTables()` in `app.js`). If you need to run migrations manually:

```bash
cd backend
npm run migrate
```

To seed demo data:

```bash
cd backend
npm run seed
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|---|---|---|
| `ECONNREFUSED` on startup | Database not ready | Wait 30s, then deploy again |
| `JWT_SECRET not set` | Missing env variable | Add `JWT_SECRET` to environment |
| `CORS error` | `FRONTEND_URL` mismatch | Set `FRONTEND_URL` to your exact frontend domain |
| `Cannot find module 'morgan'` | Missing dependency | Run `npm install` in the backend directory |
| Static files 404 | Wrong publish directory | Ensure publish dir is `dist` |

---

## Health Check

After deployment, verify the API is running:

```bash
curl https://your-app-url.com/api/health
```

Expected response:

```json
{ "success": true, "message": "EmPay API is running", "timestamp": "..." }
```
