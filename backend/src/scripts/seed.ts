// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create some users (password is plain text for local/dev; change for prod)
  const users = await prisma.user.createMany({
    data: [
      { name: "Admin User", email: "admin@examprep.com", role: "ADMIN", password: "password123" },
      { name: "Student One", email: "student1@examprep.com", role: "STUDENT", password: "password123" },
      { name: "Student Two", email: "student2@examprep.com", role: "STUDENT", password: "password123" }
    ],
    skipDuplicates: true
  });
  console.log("Users created (createMany result):", users.count);

  // Create an exam if none exists
  const exam = await prisma.exam.upsert({
    where: { name: "Sample Exam" },
    update: {},
    create: { name: "Sample Exam", syllabus: [] }
  });

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
  const o1 = await prisma.option.create({
    data: { text: "3", isCorrect: false, questionId: question.id }
  });
  const o2 = await prisma.option.create({
    data: { text: "4", isCorrect: true, questionId: question.id }
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
