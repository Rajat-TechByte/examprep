// scripts/auth/seedAuth.ts
import bcrypt from "bcrypt";
import { prisma } from "../../prisma.js";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin1@example.com";
  const studentEmail = process.env.SEED_STUDENT_EMAIL || "student1@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "AdminPass123!";
  const studentPassword = process.env.SEED_STUDENT_PASSWORD || "StudentPass123!";

  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    const hashed = await bcrypt.hash(adminPassword, BCRYPT_SALT_ROUNDS);
    await prisma.user.create({
      data: { email: adminEmail, name: "Seed Admin", role: "ADMIN", password: hashed },
    });
    console.log("Seeded admin:", adminEmail);
  }

  const studentExists = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!studentExists) {
    const hashed = await bcrypt.hash(studentPassword, BCRYPT_SALT_ROUNDS);
    await prisma.user.create({
      data: { email: studentEmail, name: "Seed Student", role: "STUDENT", password: hashed },
    });
    console.log("Seeded student:", studentEmail);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit());
