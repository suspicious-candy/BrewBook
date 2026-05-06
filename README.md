# BrewBook API

A RESTful backend for **BrewBook** — a personal coffee brewing tracker. Log your beans, brewers, brew recipes, tasting notes, and coffee news all in one place.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JWT + bcrypt |
| Validation | Zod |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)

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
```

### Run

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

---

## API Reference

Base URL: `http://localhost:5001`

### Beans `/beans`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/beans` | Get all beans |
| `POST` | `/beans` | Add a new bean |
| `PUT` | `/beans` | Update a bean |
| `DELETE` | `/beans` | Delete a bean |

### Brewers `/brewers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/brewers` | Get all brewers |
| `POST` | `/brewers` | Add a new brewer |
| `PUT` | `/brewers` | Update a brewer |
| `DELETE` | `/brewers` | Delete a brewer |

### Recipes `/recipes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/recipes` | Get all recipes |
| `POST` | `/recipes` | Create a recipe |
| `PUT` | `/recipes` | Update a recipe |
| `DELETE` | `/recipes` | Delete a recipe |

### Notes `/notes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notes` | Get all notes |
| `POST` | `/notes` | Create a note |
| `PUT` | `/notes` | Update a note |
| `DELETE` | `/notes` | Delete a note |

### News `/news`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/news` | Get all news items |
| `POST` | `/news` | Add a news item |
| `PUT` | `/news` | Update a news item |
| `DELETE` | `/news` | Delete a news item |

### Users `/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Get all users |
| `POST` | `/users` | Create a user |
| `PUT` | `/users` | Update a user |
| `DELETE` | `/users` | Delete a user |

---

## Project Structure

```
brewbook-api/
├── config/
│   └── db.js                    # MongoDB connection
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
│   └── auth.js                  # JWT verification
├── models/
│   ├── Beans.js
│   ├── Brewers.js
│   ├── news.js
│   ├── notes.js
│   └── recipe.js
├── Routes/
│   ├── Beans.js
│   ├── Brewers.js
│   ├── news.js
│   ├── notes.js
│   ├── recipe.js
│   └── users.js
├── .env.example
├── .gitignore
├── index.js
└── package.json
```

---

## Roadmap

- [ ] Implement CRUD logic in all controllers
- [ ] Add JWT auth to protected routes
- [ ] Add Zod request validation
- [ ] User registration and login endpoints
- [ ] Connect React Native mobile frontend

---

## License

MIT
