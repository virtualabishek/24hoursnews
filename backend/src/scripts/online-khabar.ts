import axios from "axios";
import { JSDOM } from "jsdom";
import type { RawScrapedArticle } from "../@types/scrapper.type.js";
import type { IScraper } from "../scrappers/scrappers.interface.js";

const SCRAPE_LIMIT = 15;

export class OnlineKhabarScraper implements IScraper {
  public async scrapeCategory(url: string): Promise<RawScrapedArticle[]> {
    try {
      console.log(`Fetching category page: ${url}`);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const dom = new JSDOM(response.data);
      const doc = dom.window.document;

      const newsItems = doc.querySelectorAll(
        ".ok-col-left .ok-grid-12 .ok-news-post"
      );
      console.log(`Found ${newsItems.length} total news items for ${url}`);

      const limitedNewsItems = Array.from(newsItems).slice(0, SCRAPE_LIMIT);

      const newsData: RawScrapedArticle[] = [];

      for (let i = 0; i < Math.min(7, newsItems.length); i++) {
        const item = newsItems[i];
        if (!item) {
          console.warn(`Item ${i} is null`);
          continue;
        }

        const titleElement = item.querySelector(
          ".post-title-wrap h4 a, .ok-post-content-wrap h2"
        );
        const linkElement = item.querySelector("a");
        const imageElement = item.querySelector(
          ".post-img-wrap img, .ok-post-thumb"
        );

        if (!titleElement || !linkElement || !imageElement) {
          console.warn(`Missing elements for item ${i}:`, {
            title: !!titleElement,
            link: !!linkElement,
            image: !!imageElement,
          });
          continue;
        }
        const articleUrl = linkElement.getAttribute("href");
        if (!articleUrl) {
          console.warn(`No href for item ${i}`);
          continue;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const articleDetails = await this.scrapeArticleDetails(articleUrl);

        if (articleDetails) {
          newsData.push({
            title: titleElement.textContent?.trim() || "No title",
            link: articleUrl,
            image: imageElement.getAttribute("src") || "No image",
            description: articleDetails.description,
            nepaliDateString: articleDetails.date,
          });
        } else {
          console.warn(`Failed to fetch details for ${articleUrl}`);
        }
      }

      console.log(
        `Scraped ${newsData.length} articles for ${url} (limit was ${SCRAPE_LIMIT})`
      );
      return newsData;
    } catch (error) {
      console.error(`Error scraping category ${url}:`, error);
      return [];
    }
  }

  private async scrapeArticleDetails(
    url: string
  ): Promise<{ description: string; date: string } | null> {
    try {
      console.log(`Fetching article details: ${url}`);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const dom = new JSDOM(response.data);
      const doc = dom.window.document;

      const descSelectors = [
        ".ok-article-content p",
        ".ok-article-body p",
        ".entry-content p",
        "article p",
      ];
      let description = "No description";
      for (const selector of descSelectors) {
        const elem = doc.querySelector(selector);
        if (elem && elem.textContent?.trim()) {
          description = elem.textContent.trim();
          break;
        }
      }

      const date =
        doc.querySelector(".ok-news-post-hour span")?.textContent?.trim() ||
        "No date";

      console.log(
        `Extracted for ${url}: desc length ${description.length}, date: ${date}`
      );
      return { description, date };
    } catch (err) {
      console.warn(`Could not fetch article details for ${url}:`, err);
      return null;
    }
  }
}
