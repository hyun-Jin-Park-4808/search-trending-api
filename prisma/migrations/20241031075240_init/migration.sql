-- AlterTable
ALTER TABLE "SearchKeyword" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "SearchKeyword_createdAt_idx" ON "SearchKeyword"("createdAt");

-- CreateIndex
CREATE INDEX "SearchKeyword_keyword_idx" ON "SearchKeyword"("keyword");
