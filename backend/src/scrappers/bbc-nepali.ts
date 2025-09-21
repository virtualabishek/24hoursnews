import axios from "axios";
import { JSDOM } from "jsdom";
import type { RawScrapedArticle } from "../@types/scrapper.type.js";

export class BBCSraper {
  public async scrapeCategory(url: string): Promise<RawScrapedArticle[]> {
    try {
      console.log(`Fetching BBC category page: ${url}`);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const dom = new JSDOM(response.data);
      const doc = dom.window.document;

      const newsItems = doc.querySelectorAll(
        'ul[data-testid="topic-promos"] li.bbc-t44f9r'
      );
      console.log(`Found ${newsItems.length} news items for ${url}`);
      const newsData: RawScrapedArticle[] = [];

      for (let i = 0; i < Math.min(6, newsItems.length); i++) {
        const item = newsItems[i];
        if (!item) {
          console.warn(`Item ${i} is null`);
          continue;
        }

        const titleElement = item.querySelector("h2.bbc-15qo654 a");
        const linkElement = item.querySelector("h2.bbc-15qo654 a");
        const imageElement = item.querySelector("img.bbc-139onq");
        const timeElement = item.querySelector("time.promo-timestamp");

        if (!titleElement || !linkElement || !imageElement || !timeElement) {
          console.warn(`Missing elements for item ${i}:`, {
            title: !!titleElement,
            link: !!linkElement,
            image: !!imageElement,
            time: !!timeElement,
          });
          continue;
        }

        let articleUrl = linkElement.getAttribute("href");
        if (articleUrl && !articleUrl.startsWith("http")) {
          articleUrl = `https://www.bbc.com${articleUrl}`;
        }
        if (!articleUrl) {
          console.warn(`No href for item ${i}`);
          continue;
        }

        let imageSrc: string | null = imageElement.getAttribute("src");

        if (!imageSrc) {
          const srcset = imageElement.getAttribute("srcset");
          if (srcset) {
            const sources = srcset.split(", ");
            imageSrc =
              sources.find((s) => s.includes("660w"))?.split(" ")[0] ??
              sources[0]?.split(" ")[0] ??
              null;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const articleDetails = await this.scrapeArticleDetails(articleUrl);

        if (articleDetails) {
          newsData.push({
            title: titleElement.textContent?.trim() || "No title",
            link: articleUrl,
            image: imageSrc || "No image",
            description: articleDetails.description,
            nepaliDateString: articleDetails.date,
          });
        } else {
          newsData.push({
            title: titleElement.textContent?.trim() || "No title",
            link: articleUrl,
            image: imageSrc || "No image",
            description: "No description available",
            nepaliDateString: timeElement.textContent?.trim() || "No date",
          });
        }
      }

      console.log(`Scraped ${newsData.length} articles for ${url}`);
      return newsData;
    } catch (error) {
      console.error(`Error scraping BBC category ${url}:`, error);
      return [];
    }
  }

  private async scrapeArticleDetails(
    url: string
  ): Promise<{ description: string; date: string } | null> {
    try {
      console.log(`Fetching BBC article details: ${url}`);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const dom = new JSDOM(response.data);
      const doc = dom.window.document;
      const firstP = doc.querySelector("div.bbc-19j92fr p.bbc-kl1u1v");
      let description = "No description";
      if (firstP && firstP.textContent?.trim()) {
        description = firstP.textContent.trim().substring(0, 200) + "..."; // Limit length
      }
      const dateElement = doc.querySelector("time.bbc-zyc2da");
      const date = dateElement?.textContent?.trim() || "No date";

      console.log(
        `Extracted for ${url}: desc length ${description.length}, date: ${date}`
      );
      return { description, date };
    } catch (err) {
      console.warn(`Could not fetch BBC article details for ${url}:`, err);
      return null;
    }
  }
}
