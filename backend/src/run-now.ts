import { ScrapingService } from "./services/scrapper.service.js";

(async () => {
  console.log("Running scrape NOW...");
  const scrapingService = new ScrapingService();
  try {
    await scrapingService.runScrape();
    console.log("Scrape finished!");
  } catch (err) {
    console.error("Scrape failed:", err);
  }
})();
