import { Request, Response } from "express";
import { validateUser } from "../services/userService.js";
import { taskService } from "../services/taskService.js";

export async function startFetch(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;

    const user = await validateUser(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    await taskService.enqueueFetchTask(user.user_id);
    res
      .status(200)
      .json({ success: true, message: "Fetch task enqueued", user });
  } catch (error) {
    console.error("Error in startFetch:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function startComment(req: Request, res: Response): Promise<void> {
  try {
    const { postId, userIds, content, attachment_url } = req.body;

    await taskService.enqueueCommentTask(
      postId,
      userIds,
      content,
      attachment_url
    );

    res
      .status(200)
      .json({ success: true, message: "Comment task enqueued", userIds });
  } catch (error) {
    console.error("Error in startComment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
