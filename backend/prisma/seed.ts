// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import runUsers from './seeds/01_users.js';
import runExamsSubjectsTopics from './seeds/02_exams_subjects_topics.js';
import runQuestionsOptions from './seeds/03_questions_options.js';
import runQuestionVersionsTags from './seeds/04_question_versions_tags.js';
import runUserExamsAnswers from './seeds/05_user_exams_answers.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding sequence...');
  await runUsers(prisma);
  await runExamsSubjectsTopics(prisma);
  await runQuestionsOptions(prisma);
  await runQuestionVersionsTags(prisma);
  await runUserExamsAnswers(prisma);
  console.log('Seeding finished ✅');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
