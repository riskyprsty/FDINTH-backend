-- CreateTable
CREATE TABLE "SelectedUsers" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectedUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SelectedUsers_userId_key" ON "SelectedUsers"("userId");

-- AddForeignKey
ALTER TABLE "SelectedUsers" ADD CONSTRAINT "SelectedUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
