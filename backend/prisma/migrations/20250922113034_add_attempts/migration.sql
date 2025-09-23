-- AlterTable
ALTER TABLE "public"."answers" ADD COLUMN     "attemptId" TEXT,
ADD COLUMN     "selectedSnapshot" JSONB;

-- CreateTable
CREATE TABLE "public"."exam_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "rawSnapshot" JSONB NOT NULL,
    "score" DECIMAL(7,3),
    "durationSec" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weak_areas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "meta" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weak_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_attempts_userId_idx" ON "public"."exam_attempts"("userId");

-- CreateIndex
CREATE INDEX "exam_attempts_examId_idx" ON "public"."exam_attempts"("examId");

-- CreateIndex
CREATE INDEX "exam_attempts_submittedAt_idx" ON "public"."exam_attempts"("submittedAt");

-- CreateIndex
CREATE INDEX "weak_areas_userId_idx" ON "public"."weak_areas"("userId");

-- CreateIndex
CREATE INDEX "weak_areas_examId_idx" ON "public"."weak_areas"("examId");

-- CreateIndex
CREATE INDEX "weak_areas_topicId_idx" ON "public"."weak_areas"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "weak_areas_userId_examId_topicId_key" ON "public"."weak_areas"("userId", "examId", "topicId");

-- CreateIndex
CREATE INDEX "answers_attemptId_idx" ON "public"."answers"("attemptId");

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_attempts" ADD CONSTRAINT "exam_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_attempts" ADD CONSTRAINT "exam_attempts_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weak_areas" ADD CONSTRAINT "weak_areas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weak_areas" ADD CONSTRAINT "weak_areas_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weak_areas" ADD CONSTRAINT "weak_areas_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
