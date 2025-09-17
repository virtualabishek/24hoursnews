import { PrismaClient } from "../src/generated/prisma/index.js";

// Initialize the Prisma Client
const prisma = new PrismaClient();

const publisherData = [
  {
    name: "Ratopati",
  },
  {
    name: "Onlinekhabar",
  },
  {
    name: "TechPana",
  },
  {
    name: "BBC Nepali",
  },
];

async function main() {
  console.log(`Start seeding ...`);

  for (const p of publisherData) {
    const publisher = await prisma.publisher.upsert({
      where: { name: p.name },
      update: {},
      create: {
        name: p.name,
      },
    });
    console.log(`Created or found publisher: ${publisher.name}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
