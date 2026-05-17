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
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import authorizationRoutes, { jwksHandler } from "./Routes/authorization.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const AUTH_SERVER_PORT = process.env.AUTH_SERVER_PORT;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log("request recieved");
    next();
});
app.use(rateLimiter);

app.get("/.well-known/jwks.json", jwksHandler);
app.use("/oauth", authorizationRoutes);
app.use("/beans", beansRoutes);
app.use("/brewers", brewersRoutes);
app.use("/news", newsRoutes);
app.use("/notes", notesRoutes);
app.use("/recipes", recipesRoutes);
app.use("/users", usersRoutes);

connectDb();

app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
app.listen(AUTH_SERVER_PORT, () => console.log(`Auth server running on port ${AUTH_SERVER_PORT}`));
