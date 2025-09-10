/*
  Warnings:

  - The `status` column on the `user_exams` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "public"."user_exams" DROP CONSTRAINT "user_exams_userId_fkey";

-- AlterTable
ALTER TABLE "public"."user_exams" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ExamStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isAnonymized" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE INDEX "user_exams_userId_examId_status_idx" ON "public"."user_exams"("userId", "examId", "status");

-- AddForeignKey
ALTER TABLE "public"."user_exams" ADD CONSTRAINT "user_exams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
