/*
  Warnings:

  - You are about to drop the column `taskType` on the `SelectedUsers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SelectedUsers" DROP COLUMN "taskType",
ADD COLUMN     "taskTypes" TEXT[];
