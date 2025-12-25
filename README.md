
# CloudNest

A lightweight cloud file management system built with React and Node.js, featuring secure authentication, Cloudinary-based file storage, and Redis-backed caching.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Quick Start — Local Development](#quick-start--local-development)
  - [Server (API)](#server-api)
  - [Client (Web App)](#client-web-app)
- [API Endpoints (Overview)](#api-endpoints-overview)
- [Troubleshooting & Notes](#troubleshooting--notes)
- [Small Notes](#small-notes)

---

## Project Overview

CloudNest is a web application for uploading and managing files in the cloud.  
It focuses on a clean authentication flow, Cloudinary-backed file storage, and a simple, scalable backend architecture.

> **Note:** Email verification and WebAuthn are intentionally disabled and not enforced.  
This README documents only the features that are fully functional.

---

## Features

- User signup and login using JWT (HTTP-only cookies)
- Avatar upload during signup (Cloudinary)
- File upload and file management
- File metadata storage
- Redis caching for selected protected routes

---

## Tech Stack

- **Frontend:** React (Vite), React Router, React Hook Form, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Cache:** Redis (used for caching; optional)
- **File Storage:** Cloudinary
- **Authentication:** JWT (HTTP-only cookies)

---

## Project Structure

```

CloudNest-main/
├─ client/          # React frontend (Vite)
├─ server/          # Node/Express backend
│  ├─ app.js
│  ├─ server.js
│  ├─ .env.sample
│  └─ src/
│     ├─ controllers/
│     ├─ routes/
│     ├─ middlewares/
│     ├─ models/
│     ├─ config/
│     └─ jobs/      # background jobs (email queue) — optional / disabled

````

---

## Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB (Atlas or local)
- Redis (only required if caching is enabled)
- Cloudinary account

---

## Environment Variables

Copy `server/.env.sample` → `server/.env` and fill in values.

```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=your_mongo_uri

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
COOKIE_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

REDIS_PORT=6379
REDIS_HOST=127.0.0.1
````

> SMTP and email-related variables are optional and not required when email verification is disabled.

---

## Quick Start — Local Development

### Server (API)

```bash
cd CloudNest-main/server
cp .env.sample .env
npm install
npm run dev
```

If you encounter Redis or BullMQ errors, disable background jobs in `server/app.js`:

```js
// import "./src/jobs/index.js";
```

---

### Client (Web App)

```bash
cd CloudNest-main/client
npm install
npm run dev
```

---

## API Endpoints (Overview)

### Auth (`/api/v1/auth`)

* `POST /signup` — signup (multipart: avatar + body)
* `POST /login` — login
* `POST /logout` — logout
* `GET /me` — get logged-in user profile (protected)

### Files (`/api/v1/files`)

* `POST /` — upload file
* `GET /` — list files
* `GET /:id` — get file metadata
* `PUT /:id` — update file
* `DELETE /:id` — delete file

---

## Troubleshooting & Notes

* **App crashes on startup:**
  Remove unused imports (e.g., `verifyEmail`) from routes if the controller no longer exports them.

* **Redis errors:**
  Ensure Redis is running or disable job imports in `app.js`.

* **Cookie issues:**
  Verify `CLIENT_URL`, `sameSite`, and `secure` cookie settings.

* **File upload fails:**
  Double-check Cloudinary credentials.

---

## Small Notes

### Email Verification

Email verification code exists in the repository, but **email verification is disabled by default**.
Users can sign up and log in immediately. The related email queue and verification routes are intentionally turned off to keep the authentication flow simple.

### WebAuthn

WebAuthn-related code exists from earlier experimentation, but it is **not enabled, enforced, or production-ready**.
It is intentionally excluded from the main feature set to avoid confusion or overclaiming.

---

*README finalized and cleaned.*

```

---
