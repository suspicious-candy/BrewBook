import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import beansRoutes from "./Routes/Beans.js";
import brewersRoutes from "./Routes/Brewers.js";
import newsRoutes from "./Routes/news.js";
import notesRoutes from "./Routes/notes.js";
import recipesRoutes from "./Routes/recipe.js";
import usersRoutes from "./Routes/users.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/beans", beansRoutes);
app.use("/brewers", brewersRoutes);
app.use("/news", newsRoutes);
app.use("/notes", notesRoutes);
app.use("/recipes", recipesRoutes);
app.use("/users", usersRoutes);

connectDb();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
