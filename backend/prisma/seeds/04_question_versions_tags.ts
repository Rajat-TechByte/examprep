// prisma/seeds/04_question_versions_tags.ts
import { PrismaClient } from '@prisma/client';

export default async function run(prisma: PrismaClient) {
  console.log('Seeding question versions and tags...');

  // create tags
  await prisma.tag.createMany({
    data: [
      { id: 'tag-easy', name: 'easy' },
      { id: 'tag-fundamental', name: 'fundamental' },
    ],
    skipDuplicates: true,
  });

  // create question versions (snapshots)
  const q1 = await prisma.question.findUnique({ where: { id: 'q-2plus2' } });
  const q2 = await prisma.question.findUnique({ where: { id: 'q-light-speed' } });

  if (!q1 || !q2) throw new Error('Questions missing — run 03_questions_options first');

  await prisma.questionVersion.create({
    data: {
      id: 'qv-2plus2-v1',
      questionId: q1.id,
      versionNumber: 1,
      text: q1.text,
      options: JSON.stringify([
        { id: 'opt-2+2-1', text: '3', isCorrect: false },
        { id: 'opt-2+2-2', text: '4', isCorrect: true },
        { id: 'opt-2+2-3', text: '5', isCorrect: false },
      ]),
      explanation: 'Simple arithmetic',
    },
  });

  await prisma.questionVersion.create({
    data: {
      id: 'qv-light-speed-v1',
      questionId: q2.id,
      versionNumber: 1,
      text: q2.text,
      options: JSON.stringify([
        { id: 'opt-c-1', text: '3e8', isCorrect: true },
        { id: 'opt-c-2', text: '1.5e8', isCorrect: false },
      ]),
    },
  });

  // attach tags to question q1 (composite PK)
  await prisma.questionTag.create({
    data: {
      questionId: q1.id,
      tagId: 'tag-easy',
    },
  });

  await prisma.questionTag.create({
    data: {
      questionId: q1.id,
      tagId: 'tag-fundamental',
    },
  });
}
