import type { RawScrapedArticle } from "../@types/scrapper.type.js";
import type { Category, Publisher } from "../generated/prisma/index.js";
import prisma from "../lib/prisma.js";
import { SCRAPPER_JOBS } from "../scrappers/scrappers.config.js";
import { adToNepaliDateString } from "../utils/adToNepaliConverter.js";

export class ScrappingService {
  public async runAllScraps() {
    console.log("=====Running the scraps:=====");
    for (const job of SCRAPPER_JOBS) {
      console.log(`\n--- Processing Publisher: ${job.publisherName} ---`);
      const publisher = await prisma.publisher.findUnique({
        where: { name: job.publisherName },
      });

      if (!publisher) {
        console.error(
          `Publisher "${job.publisherName}" not found. Please seed the database.`
        );
        continue;
      }
      const categoryPromises = job.targets.map((target) =>
        this.scrapeAndProcessCategory(job, target, publisher)
      );
      await Promise.all(categoryPromises);
    }
  }

  private async scrapeAndProcessCategory(
    job: any,
    target: any,
    publisher: Publisher
  ) {
    const { scraper, dateParser } = job;
    const { category, url } = target;

    console.log(`Scraping category: ${category} from ${url}`);
    const rawArticles = await scraper.scrapeCategory(url);

    if (rawArticles.length === 0) {
      console.log(`No articles found for ${category}.`);
      return;
    }

    // Transform articles with time distribution for BBC
    const newNewsData = this.transformArticles(
      rawArticles,
      category,
      publisher.id,
      dateParser,
      publisher.name === "BBC Nepali" 
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
    isBBC: boolean = false
  ) {
    return articles
      .map((article, index) => {
        let publishedAt = dateParser(article.nepaliDateString);
        if (!publishedAt) {
          console.warn(
            `Could not parse date "${article.nepaliDateString}" for article: ${article.title}`
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
            0
          );
        }

        const nepaliDateFull = adToNepaliDateString(publishedAt);
        const dateNepaliPart = nepaliDateFull
          ? nepaliDateFull.split(" गते")[0]
          : "अज्ञात मिति";

        return {
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
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  private async replaceNewsInCategory(
    category: Category,
    newsData: any[],
    publisherId: string
  ) {
    try {
      await prisma.$transaction([
        prisma.news.deleteMany({ where: { publisherId, category } }),
        prisma.news.createMany({ data: newsData, skipDuplicates: true }),
      ]);
      console.log(
        `Successfully replaced ${newsData.length} articles for ${category}.`
      );
    } catch (error) {
      console.error(`Transaction failed for category ${category}:`, error);
    }
  }
}
