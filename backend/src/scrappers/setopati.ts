// src/scrappers/setopati.js
import axios from "axios";
import { JSDOM } from "jsdom";
import type { RawScrapedArticle } from "../@types/scrapper.type.js";

export class SetopatiScraper {
  public async scrapeCategory(url: string): Promise<RawScrapedArticle[]> {
    try {
      console.log(`Fetching Setopati category page: ${url}`);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const dom = new JSDOM(response.data);
      const doc = dom.window.document;

      const newsItems = doc.querySelectorAll(".row.bishesh .items");
      console.log(`Found ${newsItems.length} news items for ${url}`);
      const newsData: RawScrapedArticle[] = [];

      for (let i = 0; i < Math.min(6, newsItems.length); i++) {
        const item = newsItems[i];
        if (!item) {
          console.warn(`Item ${i} is null`);
          continue;
        }

        const linkElement = item.querySelector("a");
        const titleElement = item.querySelector(".main-title");
        const imageElement = item.querySelector("figure img");
        const timeStampElement = item.querySelector(".time-stamp");

        if (
          !linkElement ||
          !titleElement ||
          !imageElement ||
          !timeStampElement
        ) {
          console.warn(`Missing elements for item ${i}:`, {
            link: !!linkElement,
            title: !!titleElement,
            image: !!imageElement,
            date: !!timeStampElement,
          });
          continue;
        }

        const articleUrl = linkElement.getAttribute("href");
        if (!articleUrl) {
          console.warn(`No href for item ${i}`);
          continue;
        }

        let fullUrl = articleUrl;
        if (!articleUrl.startsWith("http")) {
          fullUrl = `https://www.setopati.com${articleUrl}`;
        }

        // Extract date from category page directly (textContent includes the date)
        const categoryDate = timeStampElement.textContent?.trim() || "No date";

        // Delay to avoid rate-limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const articleDetails = await this.scrapeArticleDetails(fullUrl);

        let description = "No description available";
        if (articleDetails && articleDetails.description.length > 50) {
          description = articleDetails.description;
        }

        newsData.push({
          title: titleElement.textContent?.trim() || "No title",
          link: fullUrl,
          image:
            imageElement.getAttribute("src") ||
            imageElement.getAttribute("data-src") ||
            "No image",
          description,
          nepaliDateString: categoryDate, // Use category date directly
        });
      }

      console.log(`Scraped ${newsData.length} articles for ${url}`);
      return newsData;
    } catch (error) {
      console.error(`Error scraping Setopati category ${url}:`, error);
      return [];
    }
  }

  private async scrapeArticleDetails(
    url: string
  ): Promise<{ description: string; date: string } | null> {
    try {
      console.log(`Fetching Setopati article details: ${url}`);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const dom = new JSDOM(response.data);
      const doc = dom.window.document;

      // Extract description: Target p with style="text-align: justify;" (from HTML)
      const descElems = doc.querySelectorAll('p[style*="text-align: justify"]');
      let description = "";
      if (descElems.length > 0) {
        description = Array.from(descElems)
          .slice(0, 2) // First 2 paragraphs
          .map((el) => el.textContent?.trim())
          .filter(Boolean)
          .join(" ");
        if (description.length > 200) {
          description = description.substring(0, 200) + "...";
        }
      }

      // Date from article (optional)
      let date = "";
      const dateSelectors = [
        ".published-date .pub-date",
        ".publish-date",
        ".time-stamp",
        "time[datetime]",
        ".meta .date",
      ];
      for (const selector of dateSelectors) {
        const elem = doc.querySelector(selector);
        if (elem && elem.textContent?.trim()) {
          date = elem.textContent.trim();
          break;
        }
      }

      console.log(
        `Extracted for ${url}: desc length ${description.length}, date: ${date}`
      );
      return { description, date };
    } catch (err) {
      console.warn(`Could not fetch Setopati article details for ${url}:`, err);
      return { description: "", date: "" };
    }
  }
}
