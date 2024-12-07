import { Router } from "express";
import { handleAddUser, handleAddUserByLogin, handleGetAllUsers } from "../controllers/userController.js";

const router = Router();

router.get("/", handleGetAllUsers);
router.post('/add', handleAddUser);
router.post('/login', handleAddUserByLogin);



export default router;