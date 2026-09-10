import { lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { news } from "../db/schema.js";

export async function cleanupOldArticles(daysToKeep: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = (await db
    .delete(news)
    .where(lt(news.publishedAt, cutoffDate))) as unknown as
    | { affectedRows: number }
    | [{ affectedRows: number }];

  const count = Array.isArray(result)
    ? (result[0]?.affectedRows ?? 0)
    : (result.affectedRows ?? 0);

  console.log(`Deleted ${count} articles older than ${daysToKeep} days`);
  return count;
}
