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
import { randomBytes, createHash } from "crypto";
import { SignJWT, exportJWK, importPKCS8 } from "jose"; 

dotenv.config();

const app = express();

//middleware
app.use(express.json());

app.use((req,res,next)=>{
    console.log("request recieved");
    next();
});
app.use(rateLimiter);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());

const clients = new Map();
const authorizationCodes= new Map();
const refreshTokens = new Map();

clients.set("demo-client",{
    clientId:"demo-client",
    redirectUris:[`https://localhost:${CLIENT_SERVER_PORT}/callback`]
});



app.use("/beans", beansRoutes);
app.use("/brewers", brewersRoutes);
app.use("/news", newsRoutes);
app.use("/notes", notesRoutes);
app.use("/recipes", recipesRoutes);
app.use("/users", usersRoutes);

connectDb();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
