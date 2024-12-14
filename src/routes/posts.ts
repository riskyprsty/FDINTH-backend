import { Router } from "express";
import { getPosts } from "../controllers/postController.js";

const router = Router();

router.get("/", getPosts);

export default router;
