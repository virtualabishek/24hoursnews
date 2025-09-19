import { PrismaClient, Category } from "../generated/prisma/index.js";
import { OnlineKhabarScraper } from "../scrappers/online-khabar.js";
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
      console.error('Publisher "Online Khabar" not found.');
      return;
    }

    for (const target of targets) {
      console.log(`Scraping category: ${target.category}`);
      const rawArticles = await scraper.scrapeCategory(target.url);
      console.log(`Raw articles for ${target.category}:`, rawArticles);

      const newNewsData = rawArticles
        .map((article) => {
          const publishedAt = parseOnlineKhabarDate(article.nepaliDateString);
          if (!publishedAt) {
            console.warn(
              `Could not parse date "${article.nepaliDateString}" for article: ${article.title}`
            );
            return null;
          }

          return {
            nepaliTitle: article.title,
            nepaliDescription: article.description,
            url: article.link,
            imageUrl: article.image || null,
            category: target.category,
            publisherId: publisher.id,
            publishedAt,
            dateEnglish: publishedAt.toISOString().split("T")[0] || null,
            timeEnglish:
              publishedAt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }) || null,
            dateNepali: article.nepaliDateString
              .split(" ")
              .slice(0, 3)
              .join(" "),
            timeNepali: article.nepaliDateString.split(" ")[4] || null,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      console.log(
        `Processed ${newNewsData.length} articles for ${target.category}`
      );

      if (newNewsData.length > 0) {
        console.log(
          `Found ${newNewsData.length} new articles for ${target.category}. Replacing old data...`
        );
        try {
          await prisma.$transaction([
            prisma.news.deleteMany({
              where: { publisherId: publisher.id, category: target.category },
            }),
            prisma.news.createMany({ data: newNewsData }),
          ]);
          console.log(`Successfully replaced data for ${target.category}.`);
        } catch (error) {
          console.error(
            `Transaction failed for category ${target.category}:`,
            error
          );
        }
      } else {
        console.log(
          `No new articles found for ${target.category}. Old data retained.`
        );
      }
    }

    console.log("--- Online Khabar Scrape Finished ---");
  }
}
