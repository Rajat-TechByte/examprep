// prisma/seedPrevious.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create some users (password is required by your model)
  await prisma.user.createMany({
    data: [
      { name: "Admin User", email: "admin@examprep.com", role: "ADMIN", password: "password123" },
      { name: "Student One", email: "student1@examprep.com", role: "STUDENT", password: "password123" },
      { name: "Student Two", email: "student2@examprep.com", role: "STUDENT", password: "password123" }
    ],
    skipDuplicates: true
  });

  // Find existing exam by name or create it (name is NOT unique so use findFirst)
  let exam = await prisma.exam.findFirst({ where: { name: "Sample Exam" } });
  if (!exam) {
    exam = await prisma.exam.create({ data: { name: "Sample Exam", syllabus: [] } });
  }

  // Create a subject
  const subject = await prisma.subject.create({
    data: { name: "Mathematics", examId: exam.id }
  });

  // Create a topic
  const topic = await prisma.topic.create({
    data: { name: "Arithmetic", subjectId: subject.id }
  });

  // Create a question
  const question = await prisma.question.create({
    data: {
      text: "What is 2 + 2?",
      topicId: topic.id
    }
  });

  // Create options
  await prisma.option.createMany({
    data: [
      { text: "3", isCorrect: false, questionId: question.id },
      { text: "4", isCorrect: true, questionId: question.id }
    ],
    skipDuplicates: true
  });

  console.log("Seed complete:", { examId: exam.id, subjectId: subject.id, topicId: topic.id, questionId: question.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
