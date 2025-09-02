import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Users
  await prisma.user.createMany({
    data: [
      { name: 'Admin User', email: 'admin@examprep.com', role: 'ADMIN' },
      { name: 'Student One', email: 'student1@examprep.com', role: 'STUDENT' },
      { name: 'Student Two', email: 'student2@examprep.com', role: 'STUDENT' },
    ],
  });

  // 2. Exams, Subjects & Topics
  const exams = [
    {
      name: 'UPSC',
      subjects: [
        { name: 'History', topics: ['Ancient India', 'Modern India', 'World History'] },
        { name: 'Polity', topics: ['Constitution', 'Fundamental Rights', 'Parliament'] },
        { name: 'Economy', topics: ['Budget', 'Banking', 'Agriculture'] },
        { name: 'Current Affairs', topics: ['National', 'International'] },
      ],
    },
    {
      name: 'SSC',
      subjects: [
        { name: 'Quantitative Aptitude', topics: ['Algebra', 'Percentage', 'Time & Work'] },
        { name: 'Reasoning', topics: ['Coding-Decoding', 'Puzzles', 'Syllogisms'] },
        { name: 'English', topics: ['Grammar', 'Vocabulary', 'Comprehension'] },
      ],
    },
    {
      name: 'Bank PO',
      subjects: [
        { name: 'Quantitative Aptitude', topics: ['Simplification', 'Profit & Loss'] },
        { name: 'Reasoning', topics: ['Blood Relations', 'Seating Arrangement'] },
        { name: 'English', topics: ['Reading Comprehension', 'Error Spotting'] },
        { name: 'Banking Awareness', topics: ['Monetary Policy', 'Financial Terms'] },
      ],
    },
  ];

  for (const exam of exams) {
    const createdExam = await prisma.exam.create({ data: { name: exam.name } });

    for (const subject of exam.subjects) {
      const createdSubject = await prisma.subject.create({
        data: { name: subject.name, examId: createdExam.id },
      });

      for (const topic of subject.topics) {
        const createdTopic = await prisma.topic.create({
          data: { name: topic, subjectId: createdSubject.id },
        });

        // 3. Generate Questions (5 per topic using faker)
        const questions = Array.from({ length: 5 }).map(() => {
          const options = [faker.word.words(2), faker.word.words(2), faker.word.words(2), faker.word.words(2)];
          const correctAnswer = options[Math.floor(Math.random() * options.length)];
          return {
            text: faker.lorem.sentence(),
            options: JSON.stringify(options),
            correctAnswer,
            topicId: createdTopic.id,
          };
        });

        await prisma.question.createMany({ data: questions });
      }
    }
  }

  console.log('✅ Database seeded successfully with realistic exam data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
