import prisma from "../lib/prisma.js";

export async function cleanupOldArticles(daysToKeep: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const deleted = await prisma.news.deleteMany({
    where: {
      publishedAt: { lt: cutoffDate },
    },
  });

  console.log(
    `Deleted ${deleted.count} articles older than ${daysToKeep} days`
  );
  return deleted.count;
}
