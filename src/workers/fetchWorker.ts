import { PrismaClient } from "@prisma/client";
import { fetchQueue, commentQueue, likeQueue } from "../config/queue.js";
import {
  actionLike,
  fetchFeedPost,
  postComment,
} from "../services/graphApiService.js";

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
        target: "FEED",
      },
    });

    const posts = await fetchFeedPost(user.token, user.user_agent);

    for (const post of posts) {
      try {
        await prisma.post.upsert({
          where: { externalId: post.postId },
          update: {
            actorName: post.actorName,
            content: post.message || null,
            hashtags: post.hashtags,
            likersCount: parseInt(post.likersCount, 10),
            userId: userId,
          },
          create: {
            externalId: post.postId,
            actorName: post.actorName,
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

    // Update status task setelah selesai
    await prisma.task.update({
      where: { id: task.id },
      data: { status: "COMPLETED" },
    });

    return { success: true, postCount: posts.length };
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

commentQueue.process(async (job) => {
  let task;
  const { postId, userIds, content, attachment_url } = job.data;

  try {
    const post = await prisma.post.findUnique({
      where: { externalId: postId },
    });
    if (!post) throw new Error("Post not found");

    const results = [];

    for (const userId of userIds) {
      const user = await prisma.user.findUnique({ where: { user_id: userId } });
      if (!user) throw new Error(`User not found: ${userId}`);

      task = await prisma.task.create({
        data: {
          userId: userId,
          type: "COMMENT",
          status: "IN_PROGRESS",
          target: post.externalId,
        },
      });

      try {
        const comment = await postComment(
          user.token,
          user.user_agent,
          post.externalId,
          content,
          attachment_url
        );

        if (!comment) throw new Error(`Failed to post comment`);

        await prisma.comment.create({
          data: {
            externalId: comment.id,
            postId: post.externalId,
            content,
            attachment_url,
            userId,
          },
        });

        console.log(
          `Comment with ID ${comment.id} added for Post ID ${postId} by User ID ${userId}`
        );

        await prisma.task.update({
          where: { id: task.id },
          data: { status: "COMPLETED" },
        });

        results.push({ userId, success: true, comment_id: comment.id });
      } catch (error) {
        console.error(
          `Error processing comment for User ID ${userId} and Target PostID ${postId}:`,
          error
        );

        await prisma.task.update({
          where: { id: task.id },
          data: { status: "FAILED" },
        });

        results.push({ userId, success: false, error: error.message });
      }
    }

    return { success: true, results };
  } catch (error) {
    if (task) {
      await prisma.task.update({
        where: { id: task.id },
        data: { status: "FAILED" },
      });
    }
    console.error("Error in comment worker:", error);
    throw error;
  }
});

likeQueue.process(async (job) => {
  let task;
  const { commentIds, userIds } = job.data;

  try {
    const results = [];

    for (const commentId of commentIds) {
      for (const userId of userIds) {
        const user = await prisma.user.findUnique({
          where: { user_id: userId },
        });
        if (!user) throw new Error(`User not found: ${userId}`);

        task = await prisma.task.create({
          data: {
            userId: userId,
            type: "LIKE",
            status: "IN_PROGRESS",
            target: commentId,
          },
        });

        try {
          const like = await actionLike(user.token, user.user_agent, commentId);

          if (!like) throw new Error(`Failed to like object ${commentId}`);
          await prisma.like.create({
            data: {
              commentId,
              userId,
            },
          });

          console.log(
            `Likes added for Object ID ${commentId} by User ID ${userId}`
          );

          await prisma.task.update({
            where: { id: task.id },
            data: { status: "COMPLETED" },
          });

          results.push({
            userId,
            success: true,
            liked_object: commentId,
          });
        } catch (error) {
          console.error(
            `Error liking object for User ID ${userId} and Comment ID ${commentId}:`,
            error
          );

          await prisma.task.update({
            where: { id: task.id },
            data: { status: "FAILED" },
          });

          results.push({ userId, success: false, error: error.message });
        }
      }
    }

    return { success: true, results };
  } catch (error) {
    if (task) {
      await prisma.task.update({
        where: { id: task.id },
        data: { status: "FAILED" },
      });
    }
    console.error("Error in like worker:", error);
    throw error;
  }
});
