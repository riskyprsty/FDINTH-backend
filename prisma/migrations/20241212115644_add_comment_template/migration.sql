-- CreateTable
CREATE TABLE "CommentTemplate" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "attachment_url" TEXT,

    CONSTRAINT "CommentTemplate_pkey" PRIMARY KEY ("id")
);
