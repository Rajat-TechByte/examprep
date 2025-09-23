// create-question-versions.ts    <- upsert questionVersion + options + parents
// scripts/attempts/create-question-versions.ts
import { prisma } from "../../prisma.js"; 

type Opt = { id: string; text: string; isCorrect: boolean };

const payload = [
  {
    qvId: "qv-1",
    questionId: "q-1",
    versionNumber: 1,
    text: "What is the capital of X?",
    topicId: "topic-1",
    subjectId: "subject-1",
    examId: "exam-1",
    options: [
      { id: "o1", text: "A", isCorrect: false },
      { id: "o2", text: "B", isCorrect: true },
    ],
  },
  {
    qvId: "qv-2",
    questionId: "q-2",
    versionNumber: 1,
    text: "Who discovered Y?",
    topicId: "topic-2",
    subjectId: "subject-1",
    examId: "exam-1",
    options: [
      { id: "o3", text: "C", isCorrect: true },
      { id: "o4", text: "D", isCorrect: false },
    ],
  },
];

async function main() {
  for (const p of payload) {
    // upsert ancestor rows so FKs succeed
    await prisma.exam.upsert({ where: { id: p.examId }, update: { name: `Exam ${p.examId}` }, create: { id: p.examId, name: `Exam ${p.examId}` } });

    await prisma.subject.upsert({ where: { id: p.subjectId }, update: { name: `Subject ${p.subjectId}`, examId: p.examId }, create: { id: p.subjectId, name: `Subject ${p.subjectId}`, examId: p.examId } });

    await prisma.topic.upsert({ where: { id: p.topicId }, update: { name: `Topic ${p.topicId}`, subjectId: p.subjectId }, create: { id: p.topicId, name: `Topic ${p.topicId}`, subjectId: p.subjectId } });

    await prisma.question.upsert({ where: { id: p.questionId }, update: { text: p.text, topicId: p.topicId }, create: { id: p.questionId, text: p.text, topicId: p.topicId } });

    await prisma.questionVersion.upsert({
      where: { id: p.qvId },
      update: { text: p.text, versionNumber: p.versionNumber ?? 1, options: p.options },
      create: { id: p.qvId, questionId: p.questionId, versionNumber: p.versionNumber ?? 1, text: p.text, options: p.options },
    });
    console.log(`Upserted QuestionVersion ${p.qvId}`);

    for (const opt of p.options) {
      await prisma.option.upsert({
        where: { id: opt.id },
        update: { text: opt.text, isCorrect: opt.isCorrect, questionId: p.questionId },
        create: { id: opt.id, text: opt.text, isCorrect: opt.isCorrect, questionId: p.questionId },
      });
      console.log(`Upserted Option ${opt.id} for Question ${p.questionId}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

