import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Comment {
  content: string;
  attachment_url?: string;
}

export async function addTemplateComment({
  content,
  attachment_url,
}: Comment): Promise<any> {
  try {
    const commentTemplate = await prisma.commentTemplate.create({
      data: {
        content: content,
        attachment_url: attachment_url,
      },
    });

    return commentTemplate;
  } catch (error) {
    console.error("Failed to add new Comment Template");
  }
}

export async function getAllTemplateComment() {
  try {
    const commentTemplate = await prisma.commentTemplate.findMany({
      select: {
        id: true,
        content: true,
        attachment_url: true,
      },
    });

    return commentTemplate;
  } catch (error) {
    console.error("Error in getAllTemplateComment:", error);
    throw new Error("Failed to fetch all template comment from database");
  }
}
