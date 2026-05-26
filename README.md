# BrewBook API

A REST API backend for tracking coffee brewing sessions. Users can log beans, brewers, recipes, tasting notes, and read coffee news articles. Includes an OAuth 2.0 authorization server with PKCE for secure client authentication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Auth | OAuth 2.0 + PKCE, RS256 JWTs (`jose`); resource server validates via Supabase JWKS |
| Rate Limiting | Upstash Redis (`@upstash/ratelimit`) |
| Security | `helmet`, `express-mongo-sanitize`, `compression` |
| Validation | Mongoose schema validators |
| Password hashing | `bcrypt` (OAuth login uses bcrypt; user creation stores plaintext — wire up hashing before production) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- An Upstash Redis database
- A Supabase project (for resource server JWT verification)

### Install

```bash
cd BrewBook
npm install
```

### Environment Variables

Create a `.env` file in the `BrewBook/` directory (see `.env.example`):

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Port for the main API server (default: `5001`) |
| `AUTH_SERVER_PORT` | Port for the OAuth auth server (default: `3000`) |
| `CLIENT_SERVER_PORT` | Port of the OAuth client app (used to whitelist redirect URI) |
| `PRIVATE_KEY_PEM` | RS256 private key in PKCS#8 PEM format (used by the auth server to sign tokens) |
| `PUBLIC_KEY_PEM` | RS256 public key in SPKI PEM format (exposed via JWKS endpoint) |
| `ISSUER` | JWT issuer URL, e.g. `https://auth.example.com` |
| `KEY_ID` | Key ID (`kid`) embedded in JWT headers and JWKS |
| `RESOURCE_SERVER_AUDIENCE` | JWT audience claim set on every access token, e.g. `https://api.example.com` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `CLIENT_ORIGIN` | Allowed CORS origin for the API |
| `SUPABASE_URL` | Supabase project URL — resource server fetches JWKS from `{SUPABASE_URL}/auth/v1/.well-known/jwks.json` |
| `SUPABASE_JWT_SECRET` | (Optional) Supabase JWT secret for legacy HS256 projects; omit to use asymmetric JWKS verification |

> **Note:** `JWT_SECRET` / `jsonwebtoken` are not used — the OAuth server signs tokens via RS256 with `jose`.

### Run

```bash
# Development (auto-restart on change)
npm run dev

# Production
npm start

# Seed the Brewers collection with 25 preset brewers
npm run seed

# Run the news scraper (Wikipedia → MongoDB)
npm run scrape
```

The API server starts on `PORT` (default `5001`) and the OAuth auth flow on `AUTH_SERVER_PORT` (default `3000`). They run as two separate Express app instances — `authApp` (OAuth routes only) and `resourceApp` (API routes only) — so each port only exposes its own routes.

---

## API Reference

All endpoints return JSON. Errors follow `{ message: "..." }` or `{ error: "...", error_description: "..." }` for OAuth errors.

---

### Users — `/users`

Some operations are public; most require a valid Bearer token (see table below).

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/users` | Public | Create a new user |
| `GET` | `/users/email/:email` | Public | Get user by email |
| `GET` | `/users` | Required | Get all users |
| `GET` | `/users/:id` | Required | Get user by `UserID` |
| `GET` | `/users/level/:level` | Required | Get users by `userLevel` (`Bean Sprout`, `Barista`, `BrewMaster`) |
| `PUT` | `/users/:id` | Required | Update a user by `UserID` |
| `PATCH` | `/users/:id/brewcount` | Required | Increment `totalBrewsLogged` by 1 and auto-update `userLevel` |
| `DELETE` | `/users/:id` | Required | Delete a user by `UserID` |

**User levels** are automatically promoted based on `totalBrewsLogged`:
- `Bean Sprout` → default
- `Barista` → 10+ brews
- `BrewMaster` → 50+ brews

**Create / Update user body:**
```json
{
  "UserID": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "supersecret1",
  "Brewers": [1, 2]
}
```
`Brewers` accepts an array of `BrewerID` numbers resolved to ObjectIds. Omitting `Brewers` on a PUT leaves the existing brewer list unchanged.

---

### Beans — `/beans`

| Method | Path | Description |
|---|---|---|
| `GET` | `/beans` | Get all beans |
| `GET` | `/beans/:id` | Get bean by `beanId` |
| `GET` | `/beans/roast/:roast` | Filter by roast level |
| `GET` | `/beans/varietal/:varietal` | Filter by varietal |
| `GET` | `/beans/origin/:country` | Filter by origin country |
| `POST` | `/beans` | Create a new bean |
| `PUT` | `/beans/:id` | Update a bean by `beanId` |
| `PATCH` | `/beans/:id/lastBrew` | Set the bean's `lastBrew` note by `noteId` |
| `DELETE` | `/beans/:id` | Delete a bean by `beanId` |

**Roast levels:** `french`, `dark`, `dark-medium`, `medium`, `medium-light`, `light`, `green`

**Varietals:** `Typica`, `Bourbon`, `Gesha`, `Kona`, `Blue Mountain`, `Maragogype`, `Pacamara`, `Catuai`, `Pacas`, `SL-28`, `SL-34`, `Wush Wush`, `Kurume`, `Dega`, `Catimor`, `Castillo`, `Ruiri 11`

---

### Brewers — `/brewers`

| Method | Path | Description |
|---|---|---|
| `GET` | `/brewers` | Get all brewers |
| `GET` | `/brewers/:id` | Get brewer by `BrewerID` |
| `GET` | `/brewers/filter/:filterType` | Filter by filter type |
| `POST` | `/brewers` | Create a new brewer |
| `PUT` | `/brewers/:id` | Update a brewer by `BrewerID` |
| `DELETE` | `/brewers/:id` | Delete a brewer by `BrewerID` |

**Filter types:** `paper`, `metal`, `cloth`, `N/A`

Seed 25 preset brewers (V60, AeroPress, Chemex, etc.) with `npm run seed`.

---

### Recipes — `/recipes`

| Method | Path | Description |
|---|---|---|
| `GET` | `/recipes` | Get all recipes |
| `GET` | `/recipes/:id` | Get recipe by `ID` |
| `GET` | `/recipes/brewer/:id` | Get recipes by `BrewerID` |
| `GET` | `/recipes/bean/:id` | Get recipes by `beanId` |
| `GET` | `/recipes/rating/:min` | Get recipes with `overallRating >= min` |
| `POST` | `/recipes` | Create a recipe |
| `PUT` | `/recipes/:id` | Update a recipe by `ID` |
| `DELETE` | `/recipes/:id` | Delete a recipe by `ID` |

**Create / Update recipe body:**
```json
{
  "ID": 1,
  "BrewerID": 1,
  "beanId": 2,
  "CoffeeIn": 18,
  "WaterIn": 300,
  "WaterTemp": 93,
  "BrewTime": 210,
  "grindSize": 20,
  "bloomTime": 30,
  "Agitation": "yes",
  "overallRating": 8
}
```
`BrewerID` and `beanId` are resolved to ObjectIds automatically.

---

### Notes (Tasting Notes) — `/notes`

> **Protected** — all operations require a valid Bearer token.

| Method | Path | Description |
|---|---|---|
| `GET` | `/notes` | Get all notes |
| `GET` | `/notes/:id` | Get note by `ID` |
| `GET` | `/notes/brewer/:id` | Get notes for all recipes linked to a `BrewerID` |
| `GET` | `/notes/bean/:id` | Get notes for all recipes linked to a `beanId` |
| `GET` | `/notes/recipe/:id` | Get notes linked to a recipe `ID` |
| `GET` | `/notes/rating/:min` | Get notes with `overallRating >= min` |
| `POST` | `/notes` | Create a note |
| `PUT` | `/notes/:id` | Update a note by `ID` |
| `DELETE` | `/notes/:id` | Delete a note by `ID` |

**Create / Update note body:**
```json
{
  "ID": 1,
  "recipeId": 1,
  "CoffeeIn": 18,
  "WaterIn": 300,
  "WaterTemp": 93,
  "BrewTime": 210,
  "grindSize": 20,
  "bloomTime": 30,
  "Agitation": "yes",
  "tastingNotes": ["chocolate", "caramel"],
  "body": 7,
  "acidity": 6,
  "bitterness": 4,
  "overallRating": 8,
  "AdditionalNotes": "Great with light roast"
}
```
`recipeId` is resolved to a Recipe ObjectId automatically.

---

### News — `/news`

| Method | Path | Description |
|---|---|---|
| `GET` | `/news` | Get all articles |
| `GET` | `/news/:id` | Get article by `ID` |
| `GET` | `/news/author/:Author` | Get articles by author |
| `POST` | `/news` | Create an article |
| `PUT` | `/news/:id` | Update an article by `ID` |
| `DELETE` | `/news/:id` | Delete an article by `ID` |

---

### Dashboard — `/dashboard`

> **Protected** — requires a valid Bearer token. Uses `req.user.email` from the decoded JWT to look up the authenticated user.

| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard` | Returns aggregated user data: profile, bean supply, last brew session, today's brew count, and streak |

---

## OAuth 2.0 Authorization Server

The auth server implements the **Authorization Code flow with PKCE (S256)**. It runs on `AUTH_SERVER_PORT` (default `3000`).

### Flow Overview

```
Client                    Auth Server (port 3000)
  |                              |
  |  GET /oauth/authorize        |
  |  ?response_type=code         |
  |  &client_id=demo-client      |
  |  &redirect_uri=...           |
  |  &code_challenge=<S256>      |
  |  &code_challenge_method=S256 |
  |  &state=<random>             |
  | ---------------------------> |
  |                              |
  |  <-- HTML login form         |
  |                              |
  |  POST /oauth/authorize       |
  |  email=... password=...      |
  | ---------------------------> |
  |                              |
  | <-- 302 redirect with ?code  |
  |                              |
  |  POST /oauth/token           |
  |  grant_type=authorization_code
  |  code=<code>                 |
  |  redirect_uri=...            |
  |  client_id=demo-client       |
  |  code_verifier=<verifier>    |
  | ---------------------------> |
  |                              |
  | <-- { access_token, refresh_token, expires_in }
```

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/oauth/authorize` | Renders the login form after validating OAuth/PKCE params |
| `POST` | `/oauth/authorize` | Validates credentials (DB lookup + bcrypt), issues auth code, redirects to client |
| `POST` | `/oauth/token` | Exchange code or refresh token for access token |
| `GET` | `/.well-known/jwks.json` | RS256 public key in JWKS format for token verification |

### `/oauth/authorize` — Query Parameters

| Parameter | Required | Description |
|---|---|---|
| `response_type` | Yes | Must be `code` |
| `client_id` | Yes | Must be a registered client (e.g. `demo-client`) |
| `redirect_uri` | Yes | Must match the client's registered redirect URI |
| `code_challenge` | Yes | Base64url(SHA-256(code_verifier)) |
| `code_challenge_method` | Yes | Must be `S256` |
| `state` | Recommended | Opaque value echoed back to prevent CSRF |
| `scope` | No | Space-separated scopes |

### `/oauth/token` — Request Body

**Authorization Code:**
```json
{
  "grant_type": "authorization_code",
  "code": "<authorization_code>",
  "redirect_uri": "https://localhost:4000/callback",
  "client_id": "demo-client",
  "code_verifier": "<original_code_verifier>"
}
```

**Refresh Token:**
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "<refresh_token>",
  "client_id": "demo-client"
}
```

**Token Response:**
```json
{
  "access_token": "<RS256 JWT>",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "<opaque token>",
  "scope": "read write"
}
```

Access tokens expire in **15 minutes**. Refresh tokens are single-use and rotated on every refresh, with a 30-day TTL.

### Registered Clients

Clients are registered in [oauth/clients.js](oauth/clients.js). The default client is:

| Field | Value |
|---|---|
| `client_id` | `demo-client` |
| `redirect_uri` | `{CLIENT_ORIGIN}/callback`, `brewbook://callback`, Postman OAuth callbacks |

### JWKS

The RS256 public key is exposed at `GET /.well-known/jwks.json`. Consuming services can use this to verify access tokens without needing the private key.

---

## Resource Server — Protected Routes

### Token Verification

`Middleware/auth.js` verifies incoming Bearer tokens against **Supabase's JWKS endpoint** (`{SUPABASE_URL}/auth/v1/.well-known/jwks.json`). If `SUPABASE_JWT_SECRET` is set, the middleware uses HS256 shared-secret verification instead (for legacy Supabase projects). On success, the decoded JWT payload is available on `req.user`.

```
Authorization: Bearer <access_token>
```

If the token is missing, expired, or invalid the middleware returns `401 Unauthorized`.

> **Note:** The resource server currently validates tokens issued by **Supabase Auth**. Tokens issued by the custom OAuth authorization server (above) use a different issuer and key — they are not validated by the resource server middleware unless `SUPABASE_URL` and the custom auth server point to the same JWKS.

### Protected vs Public Routes

| Route prefix | Protected | Reason |
|---|---|---|
| `/users` (most operations) | Yes | Personal account data |
| `/users` — `POST /` and `GET /email/:email` | No | Account creation and lookup |
| `/notes` | Yes — all operations | Private tasting notes |
| `/dashboard` | Yes — all operations | Aggregated personal data |
| `/beans` | No | Public catalog |
| `/brewers` | No | Public catalog |
| `/recipes` | No | Public catalog |
| `/news` | No | Public content |

### Architecture Overview

```
Client (port 4000)
   │
   │  1. GET /oauth/authorize?...&code_challenge=S256
   ▼
Auth Server (port 3000)   ← /oauth/* routes
   │  Serves login form; validates credentials via MongoDB + bcrypt
   │  Issues RS256 JWT access_token + refresh_token (stored in Upstash Redis)
   │
   │  2. POST /oauth/token → { access_token }
   ▼
Client stores token
   │
   │  3. GET /dashboard   Authorization: Bearer <supabase_token>
   ▼
Resource Server (port 5001)   ← /users /notes /dashboard
   │  Middleware/auth.js verifies token via Supabase JWKS
   ▼
   Response: 200 OK / 401 Unauthorized
```

---

## Rate Limiting

All routes are protected by a sliding-window rate limiter backed by Upstash Redis:

- **Window:** 60 seconds
- **Limit:** 60 requests per IP per window
- Exceeding the limit returns `429 Too Many Requests`
- If Upstash is unreachable the error is forwarded to the Express error handler rather than blocking the request

Configured in [config/upstash.js](config/upstash.js) and applied globally in [Middleware/rateLimiter.js](Middleware/rateLimiter.js).

---

## Known Limitations

| Area | Detail |
|---|---|
| Password hashing | `bcrypt` is used for OAuth login verification but passwords are stored as plaintext during user creation. Hash in `userscreate.js` and `usersupdate.js` before production. |
| Input validation | `zod` is installed but not wired up. Controllers pass `req.body` directly to Mongoose; Mongoose schema validators are the only validation layer. |
| Mongoose error mapping | All errors (including `ValidationError` 400s) are caught and returned as 500. Add an `error.name === "ValidationError"` check to return 400 with details. |
| Auth server / resource server mismatch | The OAuth authorization server issues RS256 tokens; the resource server validates against Supabase JWKS. Wire these together (share JWKS or point the resource server at the auth server's JWKS) before production. |
| No write-endpoint auth | `POST`/`PUT`/`DELETE` on `/beans`, `/brewers`, `/recipes`, `/news` are unauthenticated — anyone can modify public catalog data. Add `Authorization` middleware to write routes before production. |
| Dead code | `Routes/token.js` and `Routes/.well-known.js` are not mounted in `index.js` — their logic has been merged into `Routes/authorization.js`. |

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `UserID` | Number | Required, unique |
| `firstName` / `lastName` | String | 2–30 chars |
| `email` | String | Unique, max 50 chars |
| `password` | String | 10–50 chars (store hashed) |
| `Brewers` | ObjectId[] | Refs to `Brewer` |
| `preferences` | Object | Preferred brewers, recipes, beans |
| `userLevel` | String | `Bean Sprout`, `Barista`, `BrewMaster` |
| `LoginData` | Object | `lastLogin`, `totalBrewsLogged`, `streak` |
| `LastBrew` | ObjectId | Ref to `Notes` |

### Bean
| Field | Type | Notes |
|---|---|---|
| `beanId` | Number | Required, unique |
| `Name` | String | 2–50 chars |
| `Origin` | Object | `Country`, `Region` |
| `Varietal` | String | Enum of 17 varietals |
| `Process` | String | Default `wash` |
| `Altitude` | Number | |
| `RoastDate` | Date | |
| `Quantity` | Number | |
| `tasteProfile` | Object | `Roast` (enum), `tastingNotes` (String[]) |
| `preferences` | Object | Preferred `recipe`, `Brewer` |
| `lastBrew` | Object | `note` ref to `Notes` |

### Brewer
| Field | Type | Notes |
|---|---|---|
| `BrewerID` | Number | Required, unique |
| `Name` | String | 2–50 chars |
| `filterType` | String | `paper`, `metal`, `cloth`, `N/A` |
| `preferences` | Object | Preferred `Recipe`, `bean` |
| `trackedParameters` | Map | Free-form key-value pairs |
| `lastBrew` | Object | `Note` ref to `Notes` |

### Recipe
| Field | Type | Notes |
|---|---|---|
| `ID` | Number | Required, unique |
| `Brewer` | ObjectId | Ref to `Brewer` |
| `bean` | ObjectId | Ref to `bean` |
| `CoffeeIn` / `WaterIn` | Number | Grams |
| `WaterTemp` | Number | Celsius |
| `BrewTime` / `bloomTime` | Number | Seconds |
| `grindSize` | Number | |
| `Agitation` | String | `yes` / `no` |
| `overallRating` | Number | |
| `RecipeBody` | String | Free-text notes |

### Notes (Tasting Notes)
| Field | Type | Notes |
|---|---|---|
| `ID` | Number | Required, unique |
| `Date` | Date | Defaults to `now` |
| `Recipe` | ObjectId | Ref to `Recipe` |
| `CoffeeIn` / `WaterIn` | Number | Grams |
| `WaterTemp` | Number | Celsius |
| `BrewTime` / `bloomTime` | Number | Seconds |
| `grindSize` | Number | |
| `Agitation` | String | `yes` / `no` |
| `tastingNotes` | String[] | |
| `body` / `acidity` / `bitterness` / `overallRating` | Number | |
| `AdditionalNotes` | String | |
| `trackedParameters` | Map | Free-form key-value pairs |

### News (Articles)
| Field | Type | Notes |
|---|---|---|
| `ID` | Number | Required, unique |
| `ArticleName` | String | 2–50 chars |
| `Author` | String | 2–50 chars |
| `ArticleLink` | String | |
| `ArticleBody` | String | |
| `trackedParameters` | Map | |

---

## Project Structure

```
BrewBook/
├── index.js                  # Entry point, Express app, server startup
├── config/
│   ├── db.js                 # Mongoose connection
│   ├── oauth.js              # PKCE helpers (generateCode, sha256Base64url, base64url)
│   └── upstash.js            # Upstash Redis rate limiter config
├── Middleware/
│   ├── auth.js               # JWT Bearer token verification via Supabase JWKS
│   └── rateLimiter.js        # Global rate limiter (60 req / 60s per IP)
├── Routes/
│   ├── authorization.js      # OAuth: GET /authorize, POST /authorize, POST /token, JWKS handler
│   ├── .well-known.js        # Standalone JWKS router (not mounted — logic is in authorization.js)
│   ├── token.js              # Standalone token router (not mounted — logic is in authorization.js)
│   ├── Beans.js
│   ├── Brewers.js
│   ├── dashboard.js
│   ├── news.js
│   ├── notes.js
│   ├── recipe.js
│   └── users.js
├── controllers/
│   ├── Beans/                # BeansCreate, BeansRead, BeansUpdate, BeansDelete
│   ├── Brewers/              # brewerscreate, brewersread, brewersupdate, brewersdelete
│   ├── News/                 # newscreate, newsread, newsupdate, newsdelete
│   ├── dashboard/            # dashboardget
│   ├── notes/                # notescreate, notesgets, notesupdate, notesdelete
│   ├── Recipes/              # recipescreate, recipesgets, recipesupdate, recipesdelete
│   └── users/                # userscreate, usersgets, usersupdate, usersdelete
├── models/
│   ├── Beans.js
│   ├── Brewers.js
│   ├── User.js
│   ├── news.js
│   ├── notes.js
│   └── recipe.js
├── oauth/
│   ├── clients.js            # Registered OAuth clients
│   └── store.js              # Upstash Redis stores for auth codes and refresh tokens
└── scripts/
    ├── seed.js               # Seeds 25 preset brewers into MongoDB
    └── scraper.js            # Scrapes Wikipedia for brewer names and upserts them
```
