import { ScrappingService } from "./services/scrapper.service.js";

(async () => {
  console.log("Running scrape NOW...");
  const scrapingService = new ScrappingService();
  try {
    await scrapingService.runAllScraps();
    console.log("Scrape finished!");
  } catch (err) {
    console.error("Scrape failed:", err);
  }
})();
