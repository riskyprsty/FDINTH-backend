import { Request, Response } from "express";
import {
  addTemplateComment,
  getAllTemplateComment,
} from "../services/commentService.js";

export async function handleAddTemplateComment(
  req: Request,
  res: Response
): Promise<void> {
  const { content, attachment_url } = req.body;

  if (!content) {
    res.status(400).json({
      success: false,
      message: "Content field is required",
    });
    return;
  }

  try {
    const comment = await addTemplateComment({ content, attachment_url });
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    console.error("Error in handleAddTemplateComment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function handleGetAllTemplateComment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const comment = await getAllTemplateComment();
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    console.error("Error in handleGetAllTemplateComment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
