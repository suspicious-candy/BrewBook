import express from "express";
import { createNews } from "../controllers/News/newscreate.js";
import { deleteNews } from "../controllers/News/newsdelete.js";
import { readNews } from "../controllers/News/newsread.js";
import { updateNews } from "../controllers/News/newsupdate.js";

const router = express.Router();

router.get("/", readNews);
router.post("/", createNews);
router.put("/", updateNews);
router.delete("/", deleteNews);

export default router;
