import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const selectedUserService = {
  async addSelectedUser(userIds: string[], taskType: string) {
    const data = userIds.map((userId) => ({ userId, taskType }));
    return await prisma.selectedUsers.createMany({
      data,
      skipDuplicates: true,
    });
  },

  async reassignSelectedUser(userIds: string[], taskType: string) {
    const operations = userIds.map((userId) =>
      prisma.selectedUsers.upsert({
        where: { userId },
        update: { taskType },
        create: { userId, taskType },
      })
    );

    return await prisma.$transaction(operations);
  },

  async getAllSelectedUser() {
    return await prisma.selectedUsers.findMany();
  },

  async removeSelectedUser(userId: string) {
    await prisma.selectedUsers.delete({
      where: { userId },
    });
  },
};
