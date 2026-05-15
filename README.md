# BrewBook API

A RESTful backend for **BrewBook** — a mobile coffee brewing tracker. Log your beans, brewers, brew recipes, tasting notes, and coffee news all in one place.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JWT (access tokens) |
| Rate Limiting | Upstash Redis (sliding window) |
| Validation | Zod |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Upstash Redis database ([upstash.com](https://upstash.com))

### Installation

```bash
git clone https://github.com/<your-username>/brewbook-api.git
cd brewbook-api
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/brewbook
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5001
UPSTASH_REDIS_REST_URL=https://<your-db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here
```

### Run

```bash
# Development (hot reload)
npm run dev

# Production
npm start

# Seed the database
npm run seed

# Run the news scraper
npm run scrape
```

---

## Middleware Stack

Middleware is applied globally in `index.js` in this order:

| # | Middleware | Purpose |
|---|-----------|---------|
| 1 | `express.json({ limit: "10kb" })` | Parse JSON bodies, cap payload size |
| 2 | `morgan` | HTTP request logging |
| 3 | `helmet` | Secure HTTP response headers |
| 4 | `cors` | Cross-origin resource sharing |
| 5 | `hpp` | Block HTTP parameter pollution attacks |
| 6 | `express-mongo-sanitize` | Strip NoSQL injection characters from input |
| 7 | `compression` | Gzip responses (important for mobile bandwidth) |
| 8 | `connect-timeout` | Kill hung requests after 10s (for unreliable mobile networks) |
| 9 | `rateLimiter` | 5 requests / 100s per IP via Upstash Redis sliding window |

Route-level middleware:

| Middleware | Applied to |
|-----------|-----------|
| `verifyToken` | All write routes (POST, PUT, PATCH, DELETE) |
| `multer` | File upload routes (profile pictures, bean/brew photos) |

---

## API Reference

Base URL: `http://localhost:5001/v1`

> All write endpoints (POST, PUT, PATCH, DELETE) require an `Authorization: Bearer <token>` header.

### Beans `/v1/beans`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/beans` | Get all beans |
| `GET` | `/beans/:id` | Get a bean by ID |
| `GET` | `/beans/roast/:roast` | Filter beans by roast level |
| `GET` | `/beans/varietal/:varietal` | Filter beans by varietal |
| `GET` | `/beans/origin/:country` | Filter beans by origin country |
| `POST` | `/beans` | Add a new bean |
| `PUT` | `/beans/:id` | Update a bean |
| `PATCH` | `/beans/:id/lastBrew` | Update the last brew date |
| `DELETE` | `/beans/:id` | Delete a bean |

### Brewers `/v1/brewers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/brewers` | Get all brewers |
| `GET` | `/brewers/:id` | Get a brewer by ID |
| `GET` | `/brewers/filter/:filterType` | Filter brewers by type |
| `POST` | `/brewers` | Add a new brewer |
| `PUT` | `/brewers/:id` | Update a brewer |
| `DELETE` | `/brewers/:id` | Delete a brewer |

### Recipes `/v1/recipes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/recipes` | Get all recipes |
| `GET` | `/recipes/:id` | Get a recipe by ID |
| `GET` | `/recipes/brewer/:id` | Get recipes by brewer |
| `GET` | `/recipes/bean/:id` | Get recipes by bean |
| `GET` | `/recipes/rating/:min` | Get recipes above a minimum rating |
| `POST` | `/recipes` | Create a recipe |
| `PUT` | `/recipes/:id` | Update a recipe |
| `DELETE` | `/recipes/:id` | Delete a recipe |

### Notes `/v1/notes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notes` | Get all notes |
| `GET` | `/notes/:id` | Get a note by ID |
| `GET` | `/notes/brewer/:id` | Get notes by brewer |
| `GET` | `/notes/bean/:id` | Get notes by bean |
| `GET` | `/notes/recipe/:id` | Get notes by recipe |
| `GET` | `/notes/rating/:min` | Get notes above a minimum rating |
| `POST` | `/notes` | Create a note |
| `PUT` | `/notes/:id` | Update a note |
| `DELETE` | `/notes/:id` | Delete a note |

### News `/v1/news`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/news` | Get all news items |
| `GET` | `/news/:id` | Get a news item by ID |
| `GET` | `/news/author/:Author` | Get news by author |
| `POST` | `/news` | Add a news item |
| `PUT` | `/news/:id` | Update a news item |
| `DELETE` | `/news/:id` | Delete a news item |

### Users `/v1/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Get all users |
| `GET` | `/users/:id` | Get a user by ID |
| `GET` | `/users/email/:email` | Get a user by email |
| `GET` | `/users/level/:level` | Get users by level |
| `POST` | `/users` | Create a user |
| `PUT` | `/users/:id` | Update a user |
| `PATCH` | `/users/:id/brewcount` | Increment a user's brew count |
| `DELETE` | `/users/:id` | Delete a user |

---

## Project Structure

```
brewbook-api/
├── config/
│   ├── db.js                    # MongoDB connection
│   └── upstash.js               # Upstash Redis + rate limiter config
├── controllers/
│   ├── Beans/
│   │   ├── BeansCreate.js
│   │   ├── BeansDelete.js
│   │   ├── BeansRead.js
│   │   └── BeansUpdate.js
│   ├── Brewers/
│   ├── News/
│   ├── notes/
│   ├── Recipes/
│   └── users/
├── Middleware/
│   ├── auth.js                  # JWT token verification
│   └── rateLimiter.js           # Per-IP rate limiting via Upstash
├── models/
│   ├── Beans.js
│   ├── Brewers.js
│   ├── news.js
│   ├── notes.js
│   ├── recipe.js
│   └── User.js
├── Routes/
│   ├── Beans.js
│   ├── Brewers.js
│   ├── news.js
│   ├── notes.js
│   ├── recipe.js
│   └── users.js
├── scripts/
│   ├── seed.js                  # Database seeder
│   └── scraper.js               # News scraper
├── .env.example
├── .gitignore
├── index.js                     # App entry point
└── package.json
```

---

## Roadmap

- [x] CRUD controllers for all resources
- [x] JWT authentication middleware
- [x] Per-IP rate limiting via Upstash Redis
- [x] Database seeder and news scraper scripts
- [ ] Apply `verifyToken` to all write routes
- [ ] API versioning (`/v1/` prefix)
- [ ] Refresh token endpoint (`/auth/refresh`)
- [ ] Global error handler + 404 handler
- [ ] Helmet, CORS, HPP, sanitize, compression, timeout middleware
- [ ] File upload support via Multer
- [ ] Connect React Native mobile frontend

---

## License

MIT
