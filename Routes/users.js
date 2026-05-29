import express from "express";
import { Authorization } from "../Middleware/auth.js";
import { ensureUser } from "../Middleware/ensureUser.js";
import { createUsers } from "../controllers/users/userscreate.js";
import { deleteUsers } from "../controllers/users/usersdelete.js";
import { getUsers, getUserByID, getUserByEmail, getUserByLevel } from "../controllers/users/usersgets.js";
import { getMe, getMyStats } from "../controllers/users/usersme.js";
import { updateUsers, updateUserBrewCount } from "../controllers/users/usersupdate.js";

const router = express.Router();

router.post("/", createUsers);
router.get("/email/:email", getUserByEmail);

router.use(Authorization);

router.get("/me", ensureUser, getMe);
router.get("/me/stats", ensureUser, getMyStats);

router.get("/", getUsers);
router.get("/level/:level", getUserByLevel);
router.get("/:id", getUserByID);
router.put("/:id", updateUsers);
router.patch("/:id/brewcount", updateUserBrewCount);
router.delete("/:id", deleteUsers);

export default router;
