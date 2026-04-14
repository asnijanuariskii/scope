import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TIPE_LEAD = [
  'EO',
  'Venue',
  'Pemerintahan',
  'Komunitas',
  'UMKM',
  'Mitra/Tenant',
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create default Superadmin user
  const superadmin = await prisma.user.upsert({
    where: { employeeId: 'SA-001' },
    update: {},
    create: {
      nama: 'Superadmin',
      employeeId: 'SA-001',
      phoneNumber: '081200000001',
      role: Role.SUPERADMIN,
    },
  });
  console.log(`✅ Superadmin user created/exists: ${superadmin.id}`);

  // 2. Create default Tipe Lead entries
  for (const nama of DEFAULT_TIPE_LEAD) {
    const tipeLead = await prisma.tipeLead.upsert({
      where: { nama },
      update: {},
      create: {
        nama,
        createdBy: superadmin.id,
      },
    });
    console.log(`✅ Tipe Lead "${tipeLead.nama}" created/exists: ${tipeLead.id}`);
  }

  console.log('🌱 Seeding complete.');
}

main()
  .catch((error) => {
    console.error('❌ Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
