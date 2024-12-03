import { Router } from "express";
import { handleAddUser, handleAddUserByLogin } from "../controllers/userController.js";

const router = Router();

router.post('/add', handleAddUser);
router.post('/login', handleAddUserByLogin);

export default router;