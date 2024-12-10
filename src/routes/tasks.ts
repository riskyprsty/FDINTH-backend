import { Router } from "express";
import {
  startComment,
  startFetch
} from "../controllers/taskController.js";
import { fetchQueue } from "../config/queue.js";

const router = Router();

router.post("/fetch-posts", startFetch);

router.post("/post-comment", startComment);

router.get("/status", async (req, res) => {
  const waiting = await fetchQueue.getWaiting(); 
  const active = await fetchQueue.getActive(); 
  const failed = await fetchQueue.getFailed(); 
  const completed = await fetchQueue.getCompleted(); 

  res.json({ waiting, active, failed, completed });
});

export default router;
