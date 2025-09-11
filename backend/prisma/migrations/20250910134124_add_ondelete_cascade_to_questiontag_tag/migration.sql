-- DropForeignKey
ALTER TABLE "public"."question_tag" DROP CONSTRAINT "question_tag_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."question_tag" DROP CONSTRAINT "question_tag_tagId_fkey";

-- AddForeignKey
ALTER TABLE "public"."question_tag" ADD CONSTRAINT "question_tag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_tag" ADD CONSTRAINT "question_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
