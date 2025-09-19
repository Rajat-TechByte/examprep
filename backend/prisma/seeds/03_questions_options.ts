// prisma/seeds/03_questions_options.ts
import { PrismaClient } from '@prisma/client';

export default async function run(prisma: PrismaClient) {
  console.log('Seeding questions + options...');

  // ensure topics exist by id used earlier
  const algebra = await prisma.topic.findUnique({ where: { id: 'topic-algebra-1' } });
  const mechanics = await prisma.topic.findUnique({ where: { id: 'topic-mechanics-1' } });

  if (!algebra || !mechanics) {
    throw new Error('Topics missing — run 02_exams_subjects_topics first');
  }

  // create questions with options
  await prisma.question.create({
    data: {
      id: 'q-2plus2',
      text: 'What is 2 + 2?',
      topicId: algebra.id,
      options: {
        create: [
          { id: 'opt-2+2-1', text: '3', isCorrect: false },
          { id: 'opt-2+2-2', text: '4', isCorrect: true },
          { id: 'opt-2+2-3', text: '5', isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      id: 'q-light-speed',
      text: 'Approximate speed of light in vacuum (m/s)?',
      topicId: mechanics.id,
      options: {
        create: [
          { id: 'opt-c-1', text: '3e8', isCorrect: true },
          { id: 'opt-c-2', text: '1.5e8', isCorrect: false },
        ],
      },
    },
  });
}
