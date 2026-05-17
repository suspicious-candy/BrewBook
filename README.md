# BrewBook API

A REST API backend for tracking coffee brewing sessions. Users can log beans, brewers, recipes, tasting notes, and read coffee news articles. Includes an OAuth 2.0 authorization server with PKCE for secure client authentication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Auth | OAuth 2.0 + PKCE, RS256 JWTs (`jose`) |
| Rate Limiting | Upstash Redis (`@upstash/ratelimit`) |
| Validation | Zod, Mongoose validators |
| Password hashing | bcrypt |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- An Upstash Redis database

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
| `JWT_SECRET` | Symmetric secret for legacy HS256 token verification |
| `PORT` | Port for the main API server (default: `5001`) |
| `AUTH_SERVER_PORT` | Port for the OAuth auth server (default: `3000`) |
| `CLIENT_SERVER_PORT` | Port of the OAuth client app (used to whitelist redirect URI) |
| `PRIVATE_KEY_PEM` | RS256 private key in PKCS#8 PEM format |
| `PUBLIC_KEY_PEM` | RS256 public key in SPKI PEM format |
| `ISSUER` | JWT issuer URL, e.g. `https://localhost:3000` |
| `KEY_ID` | Key ID (`kid`) embedded in JWT headers and JWKS |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

### Run

```bash
# Development (auto-restart on change)
npm run dev

# Production
npm start

# Seed the Brewers collection with 25 preset brewers
npm run seed

# Run the news scraper
npm run scrape
```

The API server starts on `PORT` (default `5001`) and the OAuth server on `AUTH_SERVER_PORT` (default `3000`). Both are served from the same Express app.

---

## API Reference

All endpoints return JSON. Errors follow `{ message: "..." }` or `{ error: "...", error_description: "..." }` for OAuth errors.

---

### Users — `/users`

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | Get all users |
| `GET` | `/users/:id` | Get user by `UserID` |
| `GET` | `/users/email/:email` | Get user by email |
| `GET` | `/users/level/:level` | Get users by `userLevel` (`Bean Sprout`, `Barista`, `BrewMaster`) |
| `POST` | `/users` | Create a new user |
| `PUT` | `/users/:id` | Update a user by `UserID` |
| `PATCH` | `/users/:id/brewcount` | Increment `totalBrewsLogged` by 1 and auto-update `userLevel` |
| `DELETE` | `/users/:id` | Delete a user by `UserID` |

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
`Brewers` accepts an array of `BrewerID` numbers and are resolved to ObjectIds.

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
| `GET` | `/oauth/authorize` | Initiate authorization, redirects with `?code=` |
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

Access tokens expire in **15 minutes**. Refresh tokens are single-use and rotated on every refresh.

### Registered Clients

Clients are registered in [oauth/clients.js](oauth/clients.js). The default client is:

| Field | Value |
|---|---|
| `client_id` | `demo-client` |
| `redirect_uri` | `https://localhost:<CLIENT_SERVER_PORT>/callback` |

### JWKS

The RS256 public key is exposed at `GET /.well-known/jwks.json`. Consuming services use this to verify access tokens without needing the private key.

---

## Rate Limiting

All routes are protected by a sliding-window rate limiter backed by Upstash Redis:

- **Window:** 100 seconds
- **Limit:** 5 requests per IP per window
- Exceeding the limit returns `429 Too Many Requests`

Configured in [config/upstash.js](config/upstash.js) and applied globally in [Middleware/rateLimiter.js](Middleware/rateLimiter.js).

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `UserID` | Number | Required, unique |
| `firstName` / `lastName` | String | 2–30 chars |
| `email` | String | Unique, max 50 chars |
| `password` | String | 10–50 chars |
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
│   ├── oauth.js              # PKCE helpers (generateCode, sha256Base64url)
│   └── upstash.js            # Upstash Redis rate limiter config
├── Middleware/
│   ├── auth.js               # JWT Bearer token verification middleware (HS256)
│   └── rateLimiter.js        # Global rate limiter (5 req / 100s per IP)
├── Routes/
│   ├── authorization.js      # OAuth: GET /authorize, POST /token, JWKS handler
│   ├── .well-known.js        # Standalone JWKS router (not mounted in index.js)
│   ├── token.js              # Standalone token router (not mounted in index.js)
│   ├── Beans.js
│   ├── Brewers.js
│   ├── news.js
│   ├── notes.js
│   ├── recipe.js
│   └── users.js
├── controllers/
│   ├── Beans/                # BeansCreate, BeansRead, BeansUpdate, BeansDelete
│   ├── Brewers/              # brewerscreate, brewersread, brewersupdate, brewersdelete
│   ├── News/                 # newscreate, newsread, newsupdate, newsdelete
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
│   ├── clients.js            # Registered OAuth clients (in-memory Map)
│   └── store.js              # In-memory authorization code + refresh token stores
└── scripts/
    ├── seed.js               # Seeds 25 preset brewers into MongoDB
    └── scraper.js            # News scraper
```
