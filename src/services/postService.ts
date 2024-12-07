import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllPosts = async () => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        User: {
          select: {
            username: true,
            profile_pict: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", 
      },
    });
    return posts;
  } catch (error) {
    console.error('Error while fetching posts with user profile:', error);
    throw new Error('Failed to get posts list');
  }
};
