import axios from "axios";
import { JSDOM } from "jsdom";
import type { RawScrapedArticle } from "../@types/scrapper.type.js";

export class OnlineKhabarScraper {
  private publisherName = "Onlinekhabar";
  public async scrapeCategory(url: string): Promise<RawScrapedArticle[]> {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const dom = new JSDOM(response.data);
      const doc = dom.window.document;
      const newsItems = doc.querySelectorAll(".ok-news-post");
      const newsData: RawScrapedArticle[] = [];
      for (let i = 0; i < Math.min(7, newsItems.length); i++) {
        const item = newsItems[i];
        if (!item) continue;
        const titleElement = item.querySelector(
          "h2.ok-news-title a, .ok-post-content-wrap h2 a"
        );
        const linkElement = item.querySelector("a");
        const imageElement = item.querySelector(".ok-news-post-image img");
        if (!titleElement || !linkElement || !imageElement) continue;
        const link = linkElement.href;
        const articleDetails = await this.scrapeArticleDetails(link);
        if (articleDetails) {
          newsData.push({
            title: titleElement.textContent?.trim() || "No title",
            link: link,
            image: imageElement.getAttribute("src") || "No image",
            description: articleDetails.description,
            nepaliDateString: articleDetails.date,
          });
        }
      }
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
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const dom = new JSDOM(response.data);
      const doc = dom.window.document;

      const description =
        doc.querySelector(".ok-article-content p")?.textContent?.trim() || "";
      const date =
        doc.querySelector(".ok-news-post-hour span")?.textContent?.trim() || "";

      return { description, date };
    } catch (err) {
      console.warn(`Could not fetch article details for ${url}`);
      return null;
    }
  }
}
