import type { Category } from "../db/schema.js";
import type { IScraper } from "../scrappers/scrappers.interface.js";

export interface RawScrapedArticle {
  title: string;
  link: string;
  image: string;
  description: string;
  sharedTime?: string;
  nepaliDateString: string;
}

export interface ScrapeJob {
  publisherName: string;
  scraper: IScraper;
  dateParser: (dateString: string | undefined) => Date | null;
  targets: {
    category: Category;
    url: string;
  }[];
}
