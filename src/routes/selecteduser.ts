import { Router } from "express";
import { handleAddSelectedUsers, handleReassignUser } from "../controllers/selectedUserController.js";

const router = Router();

router.post("/add", handleAddSelectedUsers);
router.post("/reassign", handleReassignUser);

export default router;