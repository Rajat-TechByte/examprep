/*
  Warnings:

  - You are about to alter the column `score` on the `user_exams` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,3)`.
  - A unique constraint covering the columns `[userId,examId,attemptNumber]` on the table `user_exams` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ExamStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABORTED');

-- AlterTable
ALTER TABLE "public"."user_exams" ALTER COLUMN "progress" SET DEFAULT '{}',
ALTER COLUMN "score" SET DATA TYPE DECIMAL(7,3);

-- CreateIndex
CREATE INDEX "user_exams_userId_idx" ON "public"."user_exams"("userId");

-- CreateIndex
CREATE INDEX "user_exams_examId_idx" ON "public"."user_exams"("examId");

-- CreateIndex
CREATE INDEX "user_exams_userId_examId_status_idx" ON "public"."user_exams"("userId", "examId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_exams_userId_examId_attemptNumber_key" ON "public"."user_exams"("userId", "examId", "attemptNumber");
