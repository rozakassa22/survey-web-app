import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('admin123!', 10);
    
    await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: {},
      create: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Admin',
        gender: 'Not Specified',
        role: Role.ADMIN,
      },
    });

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error; // Re-throw to trigger the catch block below
  }
}

main()
  .catch((e) => {
    console.error('Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Always disconnect properly
    await prisma.$disconnect();
  }); 