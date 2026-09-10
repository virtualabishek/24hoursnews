import { and, eq, lt, sql } from "drizzle-orm";
import type { RawScrapedArticle } from "../@types/scrapper.type.js";
import { db } from "../db/index.js";
import {
  news,
  publishers,
  type Category,
  type NewNews,
  type Publisher,
} from "../db/schema.js";
import { SCRAPPER_JOBS } from "../scrappers/scrappers.config.js";
import { adToNepaliDateString } from "../utils/adToNepaliConverter.js";

export class ScrappingService {
  // Serializes DB write transactions across concurrently scraped categories.
  // Parallel DELETE+INSERT batches on the same table deadlock under InnoDB
  // gap locks (esp. on remote DBs with higher latency); scraping itself stays
  // parallel — only the write is queued.
  private writeQueue: Promise<void> = Promise.resolve();

  private enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.writeQueue.then(fn, fn);
    this.writeQueue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
  public async runAllScraps() {
    console.log("=====Running the scraps:=====");
    for (const job of SCRAPPER_JOBS) {
      console.log(`\n--- Processing Publisher: ${job.publisherName} ---`);
      const publisher = await db.query.publishers.findFirst({
        where: eq(publishers.name, job.publisherName),
      });

      if (!publisher) {
        console.error(
          `Publisher "${job.publisherName}" not found. Please seed the database.`,
        );
        continue;
      }
      const categoryPromises = job.targets.map((target) =>
        this.scrapeAndProcessCategory(job, target, publisher),
      );
      await Promise.all(categoryPromises);
    }
  }

  private async scrapeAndProcessCategory(
    job: any,
    target: any,
    publisher: Publisher,
  ) {
    const { scraper, dateParser } = job;
    const { category, url } = target;

    console.log(`Scraping category: ${category} from ${url}`);
    const rawArticles = await scraper.scrapeCategory(url);

    if (rawArticles.length === 0) {
      console.log(`No articles found for ${category}.`);
      return;
    }

    const newNewsData = this.transformArticles(
      rawArticles,
      category,
      publisher.id,
      dateParser,
      publisher.name === "BBC Nepali",
    );

    if (newNewsData.length > 0) {
      await this.replaceNewsInCategory(category, newNewsData, publisher.id);
    }
  }

  private transformArticles(
    articles: RawScrapedArticle[],
    category: Category,
    publisherId: string,
    dateParser: (dateString: string | undefined) => Date | null,
    isBBC: boolean = false,
  ): NewNews[] {
    return articles
      .map((article, index) => {
        let publishedAt = dateParser(article.nepaliDateString);
        if (!publishedAt) {
          console.warn(
            `Could not parse date "${article.nepaliDateString}" for article: ${article.title}`,
          );
          return null;
        }

        if (
          isBBC &&
          publishedAt.getHours() === 12 &&
          publishedAt.getMinutes() === 0
        ) {
          const hoursDistribution = [8, 10, 12, 14, 16, 18, 20, 22];
          const hourIndex = index % hoursDistribution.length;
          const minutesOffset = Math.floor(Math.random() * 60);

          publishedAt = new Date(publishedAt);
          publishedAt.setHours(
            hoursDistribution[hourIndex] ?? 8,
            minutesOffset,
            0,
            0,
          );
        }

        const nepaliDateFull = adToNepaliDateString(publishedAt);
        const dateNepaliPart = nepaliDateFull
          ? nepaliDateFull.split(" गते")[0]
          : "अज्ञात मिति";

        const item: NewNews = {
          nepaliTitle: article.title,
          nepaliDescription: article.description,
          url: article.link,
          imageUrl: article.image || null,
          category,
          publisherId,
          publishedAt,
          dateEnglish: publishedAt.toISOString().split("T")[0],
          time: publishedAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          dateNepali: dateNepaliPart,
        };
        return item;
      })
      .filter((item): item is NewNews => item !== null);
  }

  private async replaceNewsInCategory(
    category: Category,
    newsData: NewNews[],
    publisherId: string,
  ) {
    const daysToKeep = 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Retry on InnoDB deadlock (ER_LOCK_DEADLOCK 1213) as a backstop.
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.enqueueWrite(() =>
          db.transaction(async (tx) => {
            await tx
              .delete(news)
              .where(
                and(
                  eq(news.publisherId, publisherId),
                  eq(news.category, category),
                  lt(news.publishedAt, cutoffDate),
                ),
              );
            if (newsData.length > 0) {
              // No-op update on conflict — Drizzle equivalent of
              // Prisma createMany(skipDuplicates: true) on `url` unique key.
              await tx
                .insert(news)
                .values(newsData)
                .onDuplicateKeyUpdate({ set: { url: sql`url` } });
            }
          }),
        );

        console.log(
          `Cleaned up old articles and added ${newsData.length} new articles for ${category}.`,
        );
        return;
      } catch (error) {
        if (isDeadlock(error) && attempt < 3) {
          console.warn(
            `Deadlock writing ${category}, retrying (${attempt}/3)...`,
          );
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }
        console.error(`Transaction failed for category ${category}:`, error);
        return;
      }
    }
  }
}

function isDeadlock(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { errno?: unknown; code?: unknown; message?: unknown };
  if (err.errno === 1213 || err.code === "ER_LOCK_DEADLOCK") return true;
  const cause = (error as { cause?: unknown }).cause;
  if (cause && cause !== error) return isDeadlock(cause);
  return (
    typeof err.message === "string" && err.message.includes("Deadlock found")
  );
}
