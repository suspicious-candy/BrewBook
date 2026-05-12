import express from "express";
import { createNews } from "../controllers/News/newscreate.js";
import { deleteNews } from "../controllers/News/newsdelete.js";
import { readNews, readNewsByID, readNewsByAuthor } from "../controllers/News/newsread.js";
import { updateNews } from "../controllers/News/newsupdate.js";

const router = express.Router();

router.get("/", readNews);
router.get("/author/:Author", readNewsByAuthor);
router.get("/:id", readNewsByID);
router.post("/", createNews);
router.put("/:id", updateNews);
router.delete("/:id", deleteNews);

export default router;
