/*
  Warnings:

  - You are about to drop the column `optionId` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `answers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."answers" DROP CONSTRAINT "answers_optionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."answers" DROP CONSTRAINT "answers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."answers" DROP CONSTRAINT "answers_questionVersionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."answers" DROP CONSTRAINT "answers_userId_fkey";

-- AlterTable
ALTER TABLE "public"."answers" DROP COLUMN "optionId",
DROP COLUMN "questionId",
ADD COLUMN     "selectedOptionId" TEXT;

-- CreateIndex
CREATE INDEX "answers_userId_idx" ON "public"."answers"("userId");

-- CreateIndex
CREATE INDEX "answers_questionVersionId_idx" ON "public"."answers"("questionVersionId");

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_questionVersionId_fkey" FOREIGN KEY ("questionVersionId") REFERENCES "public"."question_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
