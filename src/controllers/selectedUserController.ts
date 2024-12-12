import { Request, Response } from "express";
import { selectedUserService } from "../services/selectedUserService.js";

export async function handleAddSelectedUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { userIds, taskType } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "User IDs must be a non-empty array.",
      });

      return;
    }

    if (!taskType) {
      res.status(400).json({
        success: false,
        message: "Task type is required",
      });
      return;
    }

    const validTaskTypes = ["FETCH", "COMMENT", "LIKE"];

    if (!validTaskTypes.includes(taskType)) {
      res.status(400).json({
        success: false,
        message: "Task type must be COMMENT, FETCH, or LIKE",
      });
      return;
    }

    const result = await selectedUserService.addSelectedUser(userIds, taskType);
    res.status(201).json({
      success: true,
      message: `${result.count} users added as selected users for task ${taskType}`,
    });
  } catch (error) {
    console.error("Error in handleAddSelectedUsers:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function handleReassignUser(req: Request, res: Response): Promise<void> {
  const { userIds, taskType } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    res.status(400).json({
      success: false,
      message: "User IDs must be a non-empty array.",
    });

    return;
  }

  if (!["FETCH", "COMMENT", "LIKE"].includes(taskType)) {
    res.status(400).json({
      success: false,
      message: "Task type must be one of: FETCH, COMMENT, LIKE.",
    });

    return;
  }

  try {
    await selectedUserService.reassignSelectedUser(userIds, taskType);
    res.status(200).json({
      success: true,
      message: "Users successfully reassigned with new task type.",
    });
  } catch (error) {
    console.error("Error in reassignSelectedUser:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
