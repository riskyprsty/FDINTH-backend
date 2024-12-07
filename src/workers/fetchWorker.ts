import { PrismaClient } from "@prisma/client";
import { fetchQueue } from "../config/queue.js";
import { fetchFeedPost } from "../services/graphApiService.js";

const prisma = new PrismaClient();

fetchQueue.process(async (job) => {
  let task;

  try {
    const { userId } = job.data;

    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new Error("User not found");

    task = await prisma.task.create({
      data: {
        userId: userId,
        type: "FETCH",
        status: "IN_PROGRESS",
        data: {
          token: user.token,
          fetchTime: new Date(),
        },
      },
    });

    const posts = await fetchFeedPost(user.token, user.user_agent);
    console.log(posts);

    for (const post of posts) {
      try {
        await prisma.post.create({
          data: {
            externalId: post.postId,
            content: post.message || null,
            hashtags: post.hashtags,
            likersCount: parseInt(post.likersCount, 10),
            userId: userId,
          },
        });
      } catch (error) {
        console.error(`Failed to insert post ${post.postId}: `, error);
      }
    }

    await prisma.task.update({
      where: { id: task.id },
      data: { status: "COMPLETED" },
    });

    return { success: true, postCount: posts.length - 2 }; // Valid Post dikurang 2
  } catch (error) {
    if (task) {
      await prisma.task.update({
        where: { id: task.id },
        data: { status: "FAILED" },
      });
    }

    console.error("Error in fetchWorker: ", error);
    throw error;
  }
});
