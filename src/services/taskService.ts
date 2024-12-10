import { commentQueue, fetchQueue } from "../config/queue.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const taskService = {
    enqueueFetchTask: async (userId: string) => {
        await fetchQueue.add({userId});
    },
    enqueueCommentTask: async (postId: string, userIds: string, content: string, attachment_url?: string) => {
        await commentQueue.add({postId, userIds, content, attachment_url})
    }
}