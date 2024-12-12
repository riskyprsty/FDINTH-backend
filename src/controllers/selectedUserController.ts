import { Request, Response } from "express";
import { selectedUserService } from "../services/selectedUserService.js";

export async function handleAddSelectedUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { userIds, taskTypes } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "User IDs must be a non-empty array.",
      });
      return;
    }

    if (!taskTypes || !Array.isArray(taskTypes) || taskTypes.length === 0) {
      res.status(400).json({
        success: false,
        message: "Task types must be a non-empty array.",
      });
      return;
    }

    const validTaskTypes = ["FETCH", "COMMENT", "LIKE"];

    // Validasi setiap task type
    const invalidTaskTypes = taskTypes.filter(
      (taskType) => !validTaskTypes.includes(taskType)
    );

    if (invalidTaskTypes.length > 0) {
      res.status(400).json({
        success: false,
        message: `Invalid task types: ${invalidTaskTypes.join(
          ", "
        )}. Must be FETCH, COMMENT, or LIKE.`,
      });
      return;
    }

    const result = await selectedUserService.addSelectedUser(
      userIds,
      taskTypes
    );
    res.status(201).json({
      success: true,
      message: `${userIds.length} users added with task types: ${taskTypes.join(
        ", "
      )}`,
    });
  } catch (error) {
    console.error("Error in handleAddSelectedUsers:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

