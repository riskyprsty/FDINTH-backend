import { Request, Response } from "express";
import { getAllPosts } from "../services/postService.js";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await getAllPosts();
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to get posts list" });
  }
};
