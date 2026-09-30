import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function updateDb() {
  const updates = [
    {
      id: 'EV-MANG-0101',
      secureUrl: 'https://res.cloudinary.com/jfsfulbk/image/upload/v1790780609/terrawitness_demo/mangrove_before.jpg'
    },
    {
      id: 'EV-MANG-0102',
      secureUrl: 'https://res.cloudinary.com/jfsfulbk/image/upload/v1790780610/terrawitness_demo/mangrove_after.jpg'
    },
    {
      id: 'EV-MANG-0103',
      secureUrl: 'https://res.cloudinary.com/jfsfulbk/image/upload/v1790780611/terrawitness_demo/mangrove_progress.jpg'
    },
    {
      id: 'EV-SOL-0201',
      secureUrl: 'https://res.cloudinary.com/jfsfulbk/image/upload/v1790780612/terrawitness_demo/solar_before.jpg'
    },
    {
      id: 'EV-SOL-0202',
      secureUrl: 'https://res.cloudinary.com/jfsfulbk/image/upload/v1790780613/terrawitness_demo/solar_after.jpg'
    }
  ];

  for (const u of updates) {
    try {
      const res = await prisma.evidenceAsset.update({
        where: { id: u.id },
        data: { secureUrl: u.secureUrl }
      });
      console.log('Updated asset in DB:', res.id, '->', res.secureUrl);
    } catch (err) {
      console.warn('Could not update', u.id, err.message);
    }
  }

  await prisma.$disconnect();
}

updateDb().catch(console.error);
