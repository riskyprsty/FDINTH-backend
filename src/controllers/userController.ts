import { Request, Response } from "express";
import {
  addUser,
  AddUserByLogin,
  getAllUsers,
  validateUser,
} from "../services/userService.js";
import { taskService } from "../services/taskService.js";

export async function handleAddUser(
  req: Request,
  res: Response
): Promise<void> {
  const { cookies, token } = req.body;

  if (!cookies && !token) {
    res.status(400).json({
      success: false,
      message: "Either cookies or token is required.",
    });
    return;
  }

  try {
    const user = await addUser({ cookies, token });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in handleAddUser:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function handleAddUserByLogin(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
    return;
  }

  try {
    const user = await AddUserByLogin({ email, password });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in handleAddUserByLogin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function handleGetAllUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const users = await getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error in handleGetAllUsers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

