import { fetchQueue } from "../config/queue.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const taskService = {
    enqueueFetchTask: async (userId: string) => {
        await fetchQueue.add({userId});
    }
}