import type { RawScrapedArticle } from "../@types/scrapper.type.js";

export interface IScraper {
  scrapeCategory(url: string): Promise<RawScrapedArticle[]>;
}
