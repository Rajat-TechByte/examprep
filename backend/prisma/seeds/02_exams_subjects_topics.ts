// prisma/seeds/02_exams_subjects_topics.ts
import { PrismaClient } from '@prisma/client';

export default async function run(prisma: PrismaClient) {
  console.log('Seeding exams, subjects, topics...');

  // create exam
  const exam = await prisma.exam.upsert({
    where: { id: 'exam-1' },
    update: {},
    create: {
      id: 'exam-1',
      name: 'Sample Exam 2025',
      syllabus: { overview: 'Basic sample syllabus' },
    },
  });

  // subjects
  const math = await prisma.subject.upsert({
    where: { id: 'subject-math-1' },
    update: {},
    create: {
      id: 'subject-math-1',
      name: 'Mathematics',
      examId: exam.id,
    },
  });

  const physics = await prisma.subject.upsert({
    where: { id: 'subject-physics-1' },
    update: {},
    create: {
      id: 'subject-physics-1',
      name: 'Physics',
      examId: exam.id,
    },
  });

  // topics
  await prisma.topic.createMany({
    data: [
      { id: 'topic-algebra-1', name: 'Algebra', subjectId: math.id },
      { id: 'topic-mechanics-1', name: 'Mechanics', subjectId: physics.id },
    ],
    skipDuplicates: true,
  });
}
