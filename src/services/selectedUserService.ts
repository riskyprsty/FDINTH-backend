import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const selectedUserService = {
  async addSelectedUser(userIds: string[], taskTypes: string[]) {
    const data = userIds.map((userId) => ({
      userId,
      taskTypes: taskTypes,
    }));

    const operations = data.map((item) =>
      prisma.selectedUsers.upsert({
        where: { userId: item.userId },
        update: {
          taskTypes: {
            set: item.taskTypes, 
          },
        },
        create: {
          userId: item.userId,
          taskTypes: item.taskTypes,
        },
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
