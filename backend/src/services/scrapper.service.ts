import { PrismaClient } from "../generated/prisma/index.js";
import { Category } from "../generated/prisma/index.js";
import { OnlineKhabarScraper } from "../scrappers/online-khabar.scrapper.js";
import { parseOnlineKhabarDate } from "../utils/dateConverter.js";

const prisma = new PrismaClient();

export class ScrapingService {
  public async runOnlineKhabarScrape() {
    console.log("--- Starting Online Khabar Scrape ---");
    const scraper = new OnlineKhabarScraper();

    const targets = [
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
        category: Category.INTERNATIONAL,
        url: "https://www.onlinekhabar.com/content/international",
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
      {
        category: Category.TECHNOLOGY,
        url: "https://www.onlinekhabar.com/content/business/technology",
      },
    ];

    const publisher = await prisma.publisher.findUnique({
      where: { name: "Online Khabar" },
    });
    if (!publisher) {
      console.error(
        'Publisher "Online Khabar" not found. Please seed the database.'
      );
      return;
    }

    for (const target of targets) {
      console.log(`Scraping category: ${target.category}`);
      const rawArticles = await scraper.scrapeCategory(target.url);

      for (const article of rawArticles) {
        const existingNews = await prisma.news.findUnique({
          where: { url: article.link },
        });
        if (existingNews) {
          console.log(`Skipping existing article: ${article.title}`);
          continue;
        }

        const publishedAt = parseOnlineKhabarDate(article.nepaliDateString);
        if (!publishedAt) {
          console.warn(`Could not parse date for article: ${article.title}`);
          continue;
        }

        await prisma.news.create({
          data: {
            nepaliTitle: article.title,
            nepaliDescription: article.description,
            url: article.link,
            imageUrl: article.image,
            category: target.category,
            publisherId: publisher.id,
            publishedAt: publishedAt,
          },
        });
        console.log(`Saved article: ${article.title}`);
      }
    }
    console.log("--- Online Khabar Scrape Finished ---");
  }
}
