// backend-api/prisma/seed.ts
// Seeds known development users (one per role) with bcrypt-hashed passwords.
// Idempotent: re-running updates the existing users by email.
//
// Run it from the backend-api folder:
//   npx ts-node prisma/seed.ts
//
// DEV ONLY. Do not use these accounts/passwords in production.
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_USERS: { name: string; email: string; password: string; role: Role }[] = [
  { name: 'Admin User', email: 'admin@testflow.dev', password: 'Admin123!', role: 'ADMIN' },
  { name: 'QA User', email: 'qa@testflow.dev', password: 'Qa123456!', role: 'QA' },
  { name: 'Viewer User', email: 'user@testflow.dev', password: 'User123!', role: 'USER' },
];

async function main() {
  for (const u of SEED_USERS) {
    const password = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, password, role: u.role },
      create: { name: u.name, email: u.email, password, role: u.role },
    });
    console.log(`Seeded ${u.role} -> ${u.email}`);
  }
  console.log('Done. See seed file for dev credentials.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
