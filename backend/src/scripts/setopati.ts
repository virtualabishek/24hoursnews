import axios from "axios";
import { JSDOM } from "jsdom";
import type { RawScrapedArticle } from "../@types/scrapper.type.js";
const SCRAPE_LIMIT = 15;
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
      const limitedNewsItems = Array.from(newsItems).slice(0, SCRAPE_LIMIT);

      const newsData: RawScrapedArticle[] = [];

      for (const item of limitedNewsItems) {
        if (!item) {
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
          console.warn(`Missing elements for item :`, {
            link: !!linkElement,
            title: !!titleElement,
            image: !!imageElement,
            date: !!timeStampElement,
          });
          continue;
        }

        const articleUrl = linkElement.getAttribute("href");
        if (!articleUrl) {
          console.warn(`No href for item`);
          continue;
        }

        let fullUrl = articleUrl;
        if (!articleUrl.startsWith("http")) {
          fullUrl = `https://www.setopati.com${articleUrl}`;
        }

        // Extract date from category page (for initial reference)
        const categoryDate = timeStampElement.textContent?.trim() || "No date";

        // Extract image from category page thumbnail
        let imageUrl = "No image";
        const src = imageElement.getAttribute("src");
        const dataSrc = imageElement.getAttribute("data-src");
        if (
          src &&
          !src.includes("adsthumb") &&
          !src.includes("rectangle.png")
        ) {
          imageUrl = src;
        } else if (
          dataSrc &&
          !dataSrc.includes("adsthumb") &&
          !dataSrc.includes("rectangle.png")
        ) {
          imageUrl = dataSrc;
        }

        // Delay to avoid rate-limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const articleDetails = await this.scrapeArticleDetails(fullUrl);

        let description = "No description available";
        if (articleDetails && articleDetails.description.length > 50) {
          description = articleDetails.description;
        }

        // Use the date from article details (which includes time) instead of category date
        const nepaliDateString = articleDetails?.date || categoryDate;

        newsData.push({
          title: titleElement.textContent?.trim() || "No title",
          link: fullUrl,
          image: imageUrl,
          description,
          nepaliDateString, // Now includes time from article details
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

      // Extract description
      const descElems = doc.querySelectorAll('p[style*="text-align: justify"]');
      let description = "";
      if (descElems.length > 0) {
        description = Array.from(descElems)
          .slice(0, 2)
          .map((el) => el.textContent?.trim())
          .filter(Boolean)
          .join(" ");
        if (description.length > 200) {
          description = description.substring(0, 200) + "...";
        }
      }

      // Extract date and time from article page
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
