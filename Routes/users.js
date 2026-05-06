import express from "express";
import { createUsers } from "../controllers/users/userscreate.js";
import { deleteUsers } from "../controllers/users/usersdelete.js";
import { getUsers } from "../controllers/users/usersgets.js";
import { updateUsers } from "../controllers/users/usersupdate.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUsers);
router.put("/", updateUsers);
router.delete("/", deleteUsers);

export default router;
