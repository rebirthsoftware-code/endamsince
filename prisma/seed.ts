import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data to avoid duplicates if run multiple times
  await prisma.appointment.deleteMany();
  await prisma.personnel.deleteMany();
  await prisma.branch.deleteMany();

  // Create Branches with Images
  const branch1 = await prisma.branch.create({
    data: {
      name: 'Endamsince Merkez',
      location: 'Endam Plus — Zonguldak',
      image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Modern barbershop interior
    },
  });

  const branch2 = await prisma.branch.create({
    data: {
      name: 'Endamsince Premium',
      location: 'Endam Urban — Zonguldak',
      image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Premium interior
    },
  });

  const branch3 = await prisma.branch.create({
    data: {
      name: 'Endamsince VIP',
      location: 'Endam Junior — Zonguldak',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Luxury interior
    },
  });

  // Create Personnel with Images
  const personnelData = [
    { name: 'Ahmet Yılmaz', role: 'Baş Berber', branchId: branch1.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Mehmet Kaya', role: 'Saç Stilisti', branchId: branch1.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Can Demir', role: 'Sakal Uzmanı', branchId: branch2.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Burak Şahin', role: 'VIP Saç Tasarım', branchId: branch3.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1480429370139-e01abe113bc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Emre Çelik', role: 'Renk Uzmanı', branchId: branch3.id, pinCode: '1234', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  ];

  for (const person of personnelData) {
    await prisma.personnel.create({ data: person });
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
