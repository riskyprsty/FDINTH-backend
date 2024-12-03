import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getRandomUserAgent(): string {
  const filePath = path.resolve(__dirname, "../config/useragent.json");
  const userAgents: string[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

export async function getUserAgent(user_id: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id },
      select: { user_agent: true },
    });

    return user?.user_agent || getRandomUserAgent(); 
  } catch (error) {
    console.error("Error fetching user agent:", error);
    throw new Error("Failed to fetch user agent");
  }
}




