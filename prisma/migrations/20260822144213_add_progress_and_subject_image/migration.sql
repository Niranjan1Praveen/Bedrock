-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "DocumentProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "revisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentProgress_userId_idx" ON "DocumentProgress"("userId");

-- CreateIndex
CREATE INDEX "DocumentProgress_documentId_idx" ON "DocumentProgress"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentProgress_userId_documentId_key" ON "DocumentProgress"("userId", "documentId");

-- AddForeignKey
ALTER TABLE "DocumentProgress" ADD CONSTRAINT "DocumentProgress_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
