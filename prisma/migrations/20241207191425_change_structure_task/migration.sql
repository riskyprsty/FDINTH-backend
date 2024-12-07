/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post_externalId_key" ON "Post"("externalId");
