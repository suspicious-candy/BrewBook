import express from "express";
import { getNotes, readNotesByID, readNotesByBrewer, readNotesByBean, readNotesByMinRating } from "../controllers/notes/notesgets.js";
import { createNotes } from "../controllers/notes/notescreate.js";
import { deleteNotes } from "../controllers/notes/notesdelete.js";
import { updateNotes } from "../controllers/notes/notesupdate.js";

const router = express.Router();

router.get("/", getNotes);
router.get("/brewer/:id", readNotesByBrewer);
router.get("/bean/:id", readNotesByBean);
router.get("/rating/:min", readNotesByMinRating);
router.get("/:id", readNotesByID);
router.post("/", createNotes);
router.put("/:id", updateNotes);
router.delete("/:id", deleteNotes);

export default router;
