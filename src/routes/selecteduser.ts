import { Router } from "express";
import { handleAddSelectedUsers } from "../controllers/selectedUserController.js";

const router = Router();

router.post("/add", handleAddSelectedUsers);

export default router;