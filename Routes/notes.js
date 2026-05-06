import express from "express";
import { getNotes } from "../controllers/notes/notesgets.js";
import { createNotes } from "../controllers/notes/notescreate.js";
import { deleteNotes } from "../controllers/notes/notesdelete.js";
import { updateNotes } from "../controllers/notes/notesupdate.js";

const router = express.Router();

router.get("/", getNotes);
router.post("/", createNotes);
router.put("/", updateNotes);
router.delete("/", deleteNotes);

export default router;
