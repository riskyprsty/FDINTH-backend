import { Router } from "express";
import { handleAddTemplateComment, handleGetAllTemplateComment } from "../controllers/commentTemplateController.js";

const router = Router();

router.get("/", handleGetAllTemplateComment);
router.post("/add", handleAddTemplateComment);

export default router;