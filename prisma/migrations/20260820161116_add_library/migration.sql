-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "pageCount" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "topicId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE INDEX "Topic_subjectId_position_idx" ON "Topic"("subjectId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_slug_key" ON "Topic"("subjectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storagePath_key" ON "Document"("storagePath");

-- CreateIndex
CREATE INDEX "Document_topicId_position_idx" ON "Document"("topicId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Document_topicId_slug_key" ON "Document"("topicId", "slug");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
