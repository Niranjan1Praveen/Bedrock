-- CreateTable
CREATE TABLE "NoteTopic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteAttachment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "storagePath" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "entryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NoteTopic_userId_position_idx" ON "NoteTopic"("userId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "NoteTopic_userId_slug_key" ON "NoteTopic"("userId", "slug");

-- CreateIndex
CREATE INDEX "NoteEntry_topicId_position_idx" ON "NoteEntry"("topicId", "position");

-- CreateIndex
CREATE INDEX "NoteEntry_userId_idx" ON "NoteEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteEntry_topicId_slug_key" ON "NoteEntry"("topicId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "NoteAttachment_storagePath_key" ON "NoteAttachment"("storagePath");

-- CreateIndex
CREATE INDEX "NoteAttachment_entryId_position_idx" ON "NoteAttachment"("entryId", "position");

-- CreateIndex
CREATE INDEX "NoteAttachment_userId_idx" ON "NoteAttachment"("userId");

-- AddForeignKey
ALTER TABLE "NoteEntry" ADD CONSTRAINT "NoteEntry_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "NoteTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteAttachment" ADD CONSTRAINT "NoteAttachment_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "NoteEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Nothing here is meant to be reached over Supabase's REST API. With row level
-- security on and no policies, the publishable key sees nothing; the app
-- connects as a role that bypasses it.
ALTER TABLE "NoteTopic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NoteEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NoteAttachment" ENABLE ROW LEVEL SECURITY;
