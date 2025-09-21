// Updated src/services/scrapper.service.ts
import prisma from "../lib/prisma.js";
import { Category, type Publisher } from "../generated/prisma/index.js";
import { OnlineKhabarScraper } from "../scrappers/online-khabar.js";
import type { RawScrapedArticle } from "../@types/scrapper.type.js";
import { parseOnlineKhabarDate } from "../utils/dateConverter.js";
import {
  parseBBCDate,
  adToNepaliDateString,
} from "../utils/bbcDateConverter.js";
import { BBCSraper } from "../scrappers/bbc-nepali.js";

export class ScrapingService {
  private onlineKhabarScraper = new OnlineKhabarScraper();
  private bbcScraper = new BBCSraper();
  private onlineKhabarPublisher: Publisher | null = null;
  private bbcPublisher: Publisher | null = null;

  public async runScrape() {
    console.log("--- Starting Scraping ---");

    this.onlineKhabarPublisher = await prisma.publisher.findUnique({
      where: { name: "Online Khabar" },
    });
    this.bbcPublisher = await prisma.publisher.findUnique({
      where: { name: "BBC Nepali" },
    });

    if (!this.onlineKhabarPublisher) {
      console.error(
        'Publisher "Online Khabar" not found. Please seed the database.'
      );
    }
    if (!this.bbcPublisher) {
      console.error(
        'Publisher "BBC Nepali" not found. Please seed the database.'
      );
    }

    const onlineKhabarTargets = [
      {
        category: Category.ENTERTAINMENT,
        url: "https://www.onlinekhabar.com/content/entertainment",
      },
      {
        category: Category.BUSINESS,
        url: "https://www.onlinekhabar.com/content/business",
      },
      {
        category: Category.TECHNOLOGY,
        url: "https://www.onlinekhabar.com/content/technology",
      },
      {
        category: Category.LIFESTYLE,
        url: "https://www.onlinekhabar.com/content/lifestyle",
      },
      {
        category: Category.NATIONAL,
        url: "https://www.onlinekhabar.com/content/news/rastiya",
      },
      {
        category: Category.OPINION,
        url: "https://www.onlinekhabar.com/content/opinion",
      },
    ];

    const bbcTargets = [
      {
        category: Category.INTERNATIONAL,
        url: "https://www.bbc.com/nepali/topics/cy5nkr41gx6t",
      },
      {
        category: Category.NATIONAL,
        url: "https://www.bbc.com/nepali/topics/cyx5k2yzyj6t",
      },
      {
        category: Category.HEALTH,
        url: "https://www.bbc.com/nepali/topics/c2dwqjg83q0t",
      },
      {
        category: Category.TECHNOLOGY,
        url: "https://www.bbc.com/nepali/topics/c9de5jl3967t",
      },
    ];

    // Run Online Khabar
    if (this.onlineKhabarPublisher) {
      console.log("--- Starting Online Khabar Scrape ---");
      const onlineKhabarPromises = onlineKhabarTargets.map((target) =>
        this.scrapeAndProcessCategory(
          this.onlineKhabarScraper,
          this.onlineKhabarPublisher!,
          parseOnlineKhabarDate,
          target.category,
          target.url
        )
      );
      await Promise.all(onlineKhabarPromises);
      console.log("--- Online Khabar Scrape Finished ---");
    }

    // Run BBC
    if (this.bbcPublisher) {
      console.log("--- Starting BBC Scrape ---");
      const bbcPromises = bbcTargets.map((target) =>
        this.scrapeAndProcessCategory(
          this.bbcScraper,
          this.bbcPublisher!,
          parseBBCDate,
          target.category,
          target.url
        )
      );
      await Promise.all(bbcPromises);
      console.log("--- BBC Scrape Finished ---");
    }

    console.log("--- Scraping Finished ---");
  }

  private async scrapeAndProcessCategory(
    scraper: OnlineKhabarScraper | BBCSraper,
    publisher: Publisher,
    dateParser: (dateString: string) => Date | null,
    category: Category,
    url: string
  ) {
    console.log(`Scraping category: ${category} from ${url}`);
    const rawArticles = await scraper.scrapeCategory(url);

    if (rawArticles.length === 0) {
      console.log(`No articles found for ${category}. Old data retained.`);
      return;
    }

    const newNewsData = this.transformArticles(
      rawArticles,
      category,
      publisher.id,
      dateParser
    );

    if (newNewsData.length > 0) {
      console.log(
        `Found ${newNewsData.length} new articles for ${category}. Replacing old data...`
      );
      await this.replaceNewsInCategory(category, newNewsData, publisher.id);
    } else {
      console.log(`No new articles for ${category}. Old data retained.`);
    }
  }

  private transformArticles(
    articles: RawScrapedArticle[],
    category: Category,
    publisherId: string,
    dateParser: (dateString: string) => Date | null
  ) {
    return articles
      .map((article) => {
        const publishedAt = dateParser(article.nepaliDateString);
        if (!publishedAt) {
          console.warn(
            `Could not parse date "${article.nepaliDateString}" for article: ${article.title}`
          );
          return null;
        }

        const nepaliDateFull = adToNepaliDateString(publishedAt);
        const [dateNepaliPart] = nepaliDateFull.split(" गते");

        return {
          nepaliTitle: article.title,
          nepaliDescription: article.description,
          url: article.link,
          imageUrl: article.image || null,
          category: category,
          publisherId,
          publishedAt,
          dateEnglish: publishedAt.toISOString().split("T")[0],
          timeEnglish: publishedAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          dateNepali: dateNepaliPart, // e.g., "२०८२ असोज ३"
          timeNepali: publishedAt.toLocaleTimeString("ne-NP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }), // Nepali digits time
        };
      })
      .filter((item) => item !== null);
  }

  private async replaceNewsInCategory(
    category: Category,
    newsData: any[],
    publisherId: string
  ) {
    try {
      await prisma.$transaction([
        prisma.news.deleteMany({
          where: { publisherId, category: category },
        }),
        prisma.news.createMany({
          data: newsData,
          skipDuplicates: true,
        }),
      ]);
      console.log(`Successfully replaced data for ${category}.`);
    } catch (error) {
      console.error(`Transaction failed for category ${category}:`, error);
    }
  }
}
