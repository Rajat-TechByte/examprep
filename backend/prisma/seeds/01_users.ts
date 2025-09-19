// prisma/seeds/01_users.ts
import { PrismaClient } from '@prisma/client';

export default async function run(prisma: PrismaClient) {
  console.log('Seeding users...');
  // minimal users (passwords = hashed/stubbed strings for seed)
  await prisma.user.createMany({
    data: [
      {
        id: 'user-admin-1',
        email: 'admin@example.com',
        name: 'Admin One',
        role: 'ADMIN',
        password: 'seed-password-admin',
      },
      {
        id: 'user-student-1',
        email: 'student@example.com',
        name: 'Student One',
        role: 'STUDENT',
        password: 'seed-password-student',
      },
    ],
    skipDuplicates: true,
  });
}
