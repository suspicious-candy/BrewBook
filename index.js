import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import rateLimiter from "./Middleware/rateLimiter.js";
import beansRoutes from "./Routes/Beans.js";
import brewersRoutes from "./Routes/Brewers.js";
import newsRoutes from "./Routes/news.js";
import notesRoutes from "./Routes/notes.js";
import recipesRoutes from "./Routes/recipe.js";
import usersRoutes from "./Routes/users.js";
import dashboardRoutes from "./Routes/dashboard.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import authorizationRoutes, { jwksHandler } from "./Routes/authorization.js";
import compression from "compression"
import helmet from 'helmet';
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import fs from "fs";
import morgan from "morgan";

dotenv.config();

const PORT = process.env.PORT ?? 5001;
const AUTH_SERVER_PORT = process.env.AUTH_SERVER_PORT ?? 3000;

const stream = fs.createWriteStream("./access.log", { flags: "a" });

function applySharedMiddleware(app) {
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(helmet());
  // express-mongo-sanitize's middleware tries to assign req.query which is a
  // read-only getter in Express 5 — call the sanitize function directly on the
  // mutable parts of the request instead.
  app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body);
    if (req.params) req.params = mongoSanitize.sanitize(req.params);
    next();
  });
  app.use(morgan("combined", { stream }));
  app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }));
  app.use(rateLimiter);
  app.use(compression({
    level: 7,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  }));
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status ?? 500).json({
    message: err.message ?? "Internal Server Error",
    ...(isProd ? {} : { stack: err.stack }),
  });
}

// Authorization server — issues tokens and exposes JWKS; no resource routes here
const authApp = express();
applySharedMiddleware(authApp);
authApp.get("/.well-known/jwks.json", jwksHandler);
authApp.use("/oauth", authorizationRoutes);
authApp.use(errorHandler);

// Resource server — protected API endpoints; no OAuth routes here
const resourceApp = express();
applySharedMiddleware(resourceApp);
resourceApp.use("/beans", beansRoutes);
resourceApp.use("/brewers", brewersRoutes);
resourceApp.use("/news", newsRoutes);
resourceApp.use("/notes", notesRoutes);
resourceApp.use("/recipes", recipesRoutes);
resourceApp.use("/users", usersRoutes);
resourceApp.use("/dashboard", dashboardRoutes);
resourceApp.use(errorHandler);

connectDb().then(() => {
  authApp.listen(AUTH_SERVER_PORT, () => console.log(`Auth server running on port ${AUTH_SERVER_PORT}`));
  resourceApp.listen(PORT, () => console.log(`Resource server running on port ${PORT}`));
});
