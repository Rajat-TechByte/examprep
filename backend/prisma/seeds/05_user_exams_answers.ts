// prisma/seeds/05_user_exams_answers.ts
import { PrismaClient } from '@prisma/client';

export default async function run(prisma: PrismaClient) {
  console.log('Seeding user_exams and answers...');

  const student = await prisma.user.findUnique({ where: { id: 'user-student-1' } });
  const exam = await prisma.exam.findUnique({ where: { id: 'exam-1' } });
  const qv = await prisma.questionVersion.findUnique({ where: { id: 'qv-2plus2-v1' } });
  const option4 = await prisma.option.findUnique({ where: { id: 'opt-2+2-2' } });

  if (!student || !exam || !qv || !option4) {
    throw new Error('Dependencies missing — run previous seeds first');
  }

  // create a user exam (progress json left simple)
  await prisma.userExam.create({
    data: {
      id: 'uexam-1',
      userId: student.id,
      examId: exam.id,
      progress: JSON.stringify({ answered: 1 }),
      attemptNumber: 1,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
  });

  // create an answer referencing the questionVersion snapshot and selected option (snapshot id stored)
  await prisma.answer.create({
    data: {
      id: 'answer-1',
      userId: student.id,
      questionVersionId: qv.id,
      selectedOptionId: option4.id,
      isCorrect: true,
      timeTakenMs: 12000,
    },
  });
}
