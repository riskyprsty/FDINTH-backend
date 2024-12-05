/*
  Warnings:

  - Added the required column `user_agent` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profile_pict" TEXT,
ADD COLUMN     "user_agent" TEXT NOT NULL;
