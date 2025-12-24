# CloudNest

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start — Local Development](#quick-start---local-development)
  - [Server (API)](#server-api)
  - [Client (Web App)](#client-web-app)
- [Environment Variables](#environment-variables)
- [API Endpoints (Overview)](#api-endpoints-overview)
- [Notes & Important Implementation Details](#notes--important-implementation-details)
- [Production / Deployment Tips](#production--deployment-tips)
- [Testing & Debugging Tips](#testing--debugging-tips)
- [Contributing](#contributing)
- [License](#license)
- [Contact / Author](#contact--author)

---

## Project Overview
CloudNest is a cloud-file management system that allows authenticated users to upload, manage, stream video, and share files. It demonstrates a production-minded backend (security middlewares, rate limiting, sanitization, job queueing, file streaming) and a modern frontend (React + Vite, Redux RTK Query, Tailwind + PrimeReact components).

---

## Features
- User authentication (signup, login, JWT cookies)
- Email verification via queue (BullMQ + Redis + Nodemailer)
- WebAuthn (passkeys) integration for 2FA and/or passwordless flows
- File upload to Cloudinary (images, videos, docs, etc.)
- File listing, download, update, delete
- Streaming endpoint for video files
- Redis caching for some endpoints
- Security hardening: helmet, xss-clean, express-mongo-sanitize, HPP, rate limiting
- Healthcheck endpoint for platform hosts

---

## Tech Stack
- Frontend: React (18) + Vite, Redux Toolkit, RTK Query, React Router, Tailwind CSS, PrimeReact
- Backend: Node.js (ESM) + Express
- Database: MongoDB (Mongoose)
- File Storage: Cloudinary
- Queue & Background Jobs: Redis + BullMQ
- Email: Nodemailer
- Auth: JWT Cookies + WebAuthn helpers (`@simplewebauthn/server`)
- Misc: Winston logger, Helmet, Rate Limiter, Compression, CORS

---

## Project Structure (high-level)
```

/
├─ client/                 # React + Vite frontend
│  ├─ src/
│  ├─ package.json
│  └─ .env
└─ server/                 # Express API
├─ server.js
├─ app.js
├─ src/
│  ├─ controllers/
│  ├─ routes/
│  ├─ models/
│  ├─ jobs/            # BullMQ queues and workers
│  ├─ config/          # DB, Redis, mailer, logger
│  └─ middlewares/
└─ .env.sample

````

---

## Prerequisites
- Node.js v18.x (project's `engines` specify Node 18)
- npm (or yarn)
- MongoDB (Atlas or local)
- Redis (for BullMQ background jobs)
- Cloudinary account (cloud name, API key & secret)
- SMTP credentials (for sending verification emails)
- Optional: an SMTP testing tool or service (Mailtrap, SendGrid, etc.)

---

## Quick Start — Local Development

> Run server and client in separate terminals.

### Server (API)
1. Open terminal:
```bash
cd server
cp .env.sample .env
# Edit .env to fill in MONGO_URI, CLOUDINARY_*, REDIS_*, SMTP_*, JWT_SECRET, CLIENT_URL, etc.
npm install
npm run dev
````

* Server default port: `3000` (set via `PORT` env var)
* Healthcheck: `GET /` returns JSON `{ success: true, message: "CloudNest API is running 🚀" }`

### Client (Web App)

1. Open another terminal:

```bash
cd client
# Edit client/.env if you need to change the API base URL (VITE_SERVER_BASE_URL)
npm install
npm run dev
```

* Vite dev server will start (default port ≈ `5173`) and reads `VITE_SERVER_BASE_URL` from `client/.env`.

---

## Environment Variables

Copy these from `server/.env.sample` and fill them with your values.

**Server (`server/.env`)**

```
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_IN=7

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

REDIS_PORT=6379
REDIS_HOST=127.0.0.1
# REDIS_PASSWORD=your_redis_password (if applicable)

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
FROM_EMAIL="CloudNest <no-reply@yourdomain.com>"
```

**Client (`client/.env`)**

```
VITE_SERVER_BASE_URL=http://localhost:3000/api/v1/
```

---

## API Endpoints (Overview)

> All endpoints are prefixed with `/api/v1/` (see `app.js`).

**Authentication**

* `POST /api/v1/auth/signup` — user signup (supports avatar upload).
* `POST /api/v1/auth/login` — login (receives cookie with JWT).
* `GET  /api/v1/auth/logout` — logout (clear cookie).
* `GET  /api/v1/auth/verify-email` — email verification link handler.
* `GET  /api/v1/auth/me` — get profile (protected).
* `POST /api/v1/auth/two-factor-auth` — setup WebAuthn / 2FA.
* `POST /api/v1/auth/verify-two-factor-auth` — verify WebAuthn assertion.

**Files (protected)**

* `GET  /api/v1/files` — list all user files.
* `POST /api/v1/files` — upload multiple files (`multipart/form-data`).
* `GET  /api/v1/files/:id` — file metadata / download URL.
* `PUT  /api/v1/files/:id` — update file (metadata & optional upload).
* `DELETE /api/v1/files/:id` — delete file.
* `POST /api/v1/files/upload-stream-video` — upload stream video.
* `GET  /api/v1/files/get-stream-video` — get a streaming video URL/stream.

**Health**

* `GET /` — health check (useful for hosting providers like Render)

---

## Notes & Important Implementation Details

* **File Storage**: Files are uploaded to Cloudinary. Make sure `CLOUDINARY_*` env vars are set.
* **Background Emails**: Uses Redis + BullMQ. Ensure Redis is reachable (`REDIS_HOST`, `REDIS_PORT`) before starting workers.
* **WebAuthn**: Code uses `@simplewebauthn/server` for passkeys / two-factor setup — make sure the frontend is served over HTTPS when testing WebAuthn in production.
* **Security**: The server applies many middlewares: `helmet`, `express-mongo-sanitize`, `xss-clean`, `hpp`, `rateLimiter`. Keep them configured for production.
* **Logging**: Winston is configured. Check `logs.log` / `error.log` for runtime issues.
* **Redis Caching**: Some routes use Redis caching; if Redis is unavailable, cache calls may fail — ensure stable Redis for expected behavior.
* **Streaming**: Video streaming endpoints are set up to stream video from Cloudinary / stored source; verify Cloudinary transformation settings for streaming formats.

---

## Production / Deployment Tips

* **Build the client**:

  ```bash
  cd client
  npm run build
  ```

  Then host the `dist/` on Netlify / Vercel OR serve it from a static hosting S3/CloudFront.

* **Server Deployment**:

  * Use `NODE_ENV=production`.
  * Provide all production env vars (Mongo Atlas, production Redis, SMTP).
  * Consider deploying to Render, Heroku, DigitalOcean App Platform, or a VPS.
  * Make sure to set `CLIENT_URL` to where your frontend is hosted.

* **Worker Processes**:

  * The app uses BullMQ Worker(s) — ensure your hosting runs the worker (or run the server which instantiates workers) and that Redis is reachable.
  * Configure monitoring (Bull Board / custom) for job visibility if needed.

* **HTTPS & WebAuthn**:

  * WebAuthn requires secure context (HTTPS or localhost). For production, enable HTTPS.

---

## Testing & Debugging Tips

* Check server logs (`logs.log`, `error.log`) for stack traces and worker logs.
* Use Postman to test protected endpoints (cookie-based JWT authentication — login returns cookie).
* If email jobs don't send: verify Redis connection, then SMTP settings.
* If file uploads fail: confirm Cloudinary credentials and allowed file size/format.

---

## Contributing

1. Fork the repo
2. Create a new branch: `git checkout -b feat/your-feature`
3. Commit changes and open a PR
4. Keep changes focused & include tests where appropriate

---

## License

This project uses the **MIT License**. (Change to your license of choice if different.)

---

## Contact / Author

If you find issues or want to discuss features, open a GitHub issue or PR.
Enjoy building with CloudNest! 🚀

---

### Quick Commands Summary

```bash
# server
cd server
cp .env.sample .env   # fill it out
npm install
npm run dev

# client
cd client
# edit client/.env if needed
npm install
npm run dev
```

```
```

---

```
```
