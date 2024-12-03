import { PrismaClient } from "@prisma/client";
import {
  retrieveUserData,
  retrieveUserDataFromToken,
} from "./graphApiService.js";
import { loginByEmailAndPassword } from "./classicLoginService.js";
import { getRandomUserAgent } from "../utils/userAgent.js";

const prisma = new PrismaClient();

interface AddUserInput {
  cookies?: string;
  token?: string;
}

interface AddUserLogin {
  email: string;
  password: string;
}

export async function addUser({ cookies, token }: AddUserInput): Promise<any> {
  try {
    const user_agent = getRandomUserAgent();
    const userData = cookies
      ? await retrieveUserData(cookies, user_agent)
      : await retrieveUserDataFromToken(token!, user_agent);

    if (!userData) {
      throw new Error("Failed to retrieve user data.");
    }

    const { user_id, username, token: userToken } = userData;

    const user = await prisma.user.upsert({
      where: { username },
      update: { token: userToken, cookies },
      create: { user_id, username, token: userToken, cookies, user_agent },
    });

    return user;
  } catch (error) {
    console.error("Error adding/updating user:", error);
    throw new Error("Failed to save user data");
  }
}

export async function AddUserByLogin({
  email,
  password,
}: AddUserLogin): Promise<any> {
  try {
    const user_agent = getRandomUserAgent();
    const loginResult = await loginByEmailAndPassword(email, password, user_agent);

    if (!loginResult) {
      throw new Error("Failed to login with email and password");
    }

    const { token, cookies } = loginResult;

    const userData = await retrieveUserDataFromToken(token, user_agent);

    if (!userData) {
      throw new Error("Failed to retrieve user data.");
    }

    const { user_id, username } = userData;

    const user = await prisma.user.upsert({
      where: { username },
      update: { token, cookies },
      create: { user_id, username, token, cookies, user_agent },
    });

    return user;
  } catch (error) {
    console.error("Error adding/updating user:", error);
    throw new Error("Failed to save user data");
  }
}
