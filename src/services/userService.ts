import { PrismaClient } from "@prisma/client";
import {
  retrieveUserData,
  retrieveUserDataFromToken,
} from "./graphApiService.js";
import { loginByEmailAndPassword } from "./classicLoginService.js";

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
    const userData = cookies
      ? await retrieveUserData(cookies)
      : await retrieveUserDataFromToken(token!);

    if (!userData) {
      throw new Error("Failed to retrieve user data.");
    }

    const { user_id, username, token: userToken } = userData;

    const user = await prisma.user.upsert({
      where: { username },
      update: { token: userToken, cookies },
      create: { user_id, username, token: userToken, cookies },
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
    const loginResult = await loginByEmailAndPassword(email, password);

    if (!loginResult) {
      throw new Error("Failed to login with email and password");
    }

    const { token, cookies } = loginResult;

    const userData = await retrieveUserDataFromToken(token);

    if (!userData) {
      throw new Error("Failed to retrieve user data.");
    }

    const { user_id, username } = userData;

    const user = await prisma.user.upsert({
      where: { username },
      update: { token, cookies },
      create: { user_id, username, token, cookies },
    });

    return user;
  } catch (error) {
    console.error("Error adding/updating user:", error);
    throw new Error("Failed to save user data");
  }
}
