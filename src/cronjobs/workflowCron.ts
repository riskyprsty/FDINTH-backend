import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import { fetchQueue, commentQueue, likeQueue } from "../config/queue.js";

const prisma = new PrismaClient();

// **Cronjob Utama untuk Menjalankan Workflow**
async function runWorkflow() {
  console.log(
    `[${new Date().toISOString()}] Memulai workflow "FETCH -> COMMENT -> LIKE"...`
  );

  // **Step 1: Tambahkan Tugas ke Fetch Queue**
  const fetchUsers = await prisma.selectedUsers.findMany({
    where: {
      taskTypes: {
        has: "FETCH",
      },
    },
  });

  if (fetchUsers.length === 0) {
    console.log("Tidak ada user yang dijadwalkan untuk tugas FETCH.");
  } else {
    console.log(`Menambahkan ${fetchUsers.length} user ke fetchQueue.`);
    for (const user of fetchUsers) {
      await fetchQueue.add(
        { userId: user.userId },
        { jobId: `fetch-${user.userId}` }
      );
    }
  }

  // **Step 2: Tambahkan Tugas ke Comment Queue**
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 jam lalu
  const latestPosts = await prisma.post.findMany({
    where: {
      createdAt: {
        gte: twoHoursAgo,
      },
      NOT: {
        hasBeenCommented: true,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  const commentUsers = await prisma.selectedUsers.findMany({
    where: {
      taskTypes: {
        has: "COMMENT",
      },
    },
  });

  if (latestPosts.length === 0 || commentUsers.length === 0) {
    console.log("Tidak ada post terbaru atau user untuk tugas COMMENT.");
  } else {
    console.log(
      `Menambahkan ${
        latestPosts.length * commentUsers.length
      } tugas ke commentQueue.`
    );
    for (const post of latestPosts) {
      for (const user of commentUsers) {
        const commentData = await prisma.commentTemplate.findFirst();
        await commentQueue.add(
          {
            postId: post.externalId,
            userIds: [user.userId],
            content: commentData?.content || "Default Comment",
            attachment_url: commentData?.attachment_url || null,
          },
          {
            jobId: `comment-${user.userId || "unknown"}-${
              post.externalId || "unknown"
            }`,
          }
        );
      }

      await prisma.post.update({
        where: { externalId: post.externalId },
        data: { hasBeenCommented: true },
      });
    }
  }

  // **Step 3: Tambahkan Tugas ke Like Queue**
  const latestComments = await prisma.comment.findMany({
    where: {
      createdAt: {
        gte: twoHoursAgo,
      },
      NOT: {
        hasBeenLiked: true,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  const likeUsers = await prisma.selectedUsers.findMany({
    where: {
      taskTypes: {
        has: "LIKE",
      },
    },
  });

  if (latestComments.length === 0 || likeUsers.length === 0) {
    console.log("Tidak ada komentar terbaru atau user untuk tugas LIKE.");
  } else {
    console.log(
      `Menambahkan ${
        latestComments.length * likeUsers.length
      } tugas ke likeQueue.`
    );
    for (const comment of latestComments) {
      for (const user of likeUsers) {
        await likeQueue.add(
          {
            commentIds: [comment.externalId],
            userIds: [user.userId],
          },
          {
            jobId: `like-${user.userId || "unknown"}-${
              comment.externalId || "unknown"
            }`,
          }
        );
      }

      await prisma.comment.update({
        where: { externalId: comment.externalId },
        data: { hasBeenLiked: true },
      });
    }
  }

  console.log(`[${new Date().toISOString()}] Workflow selesai.`);
}

// **Penjadwalan Cronjob**
cron.schedule("*/5 * * * *", async () => {
  try {
    console.log(`[${new Date().toISOString()}] Menjalankan cronjob workflow.`);
    await runWorkflow();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error dalam workflow:`, error);
  }
});
