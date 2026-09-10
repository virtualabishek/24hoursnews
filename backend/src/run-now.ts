import { pool } from "./db/index.js";
import { ScrappingService } from "./services/scrapper.service.js";

(async () => {
  console.log("Running scrape NOW...");
  const scrapingService = new ScrappingService();
  let failed = false;
  try {
    await scrapingService.runAllScraps();
    console.log("Scrape finished!");
  } catch (err) {
    failed = true;
    console.error("Scrape failed:", err);
  } finally {
    // Release pool connections so the one-shot script exits cleanly.
    await pool.end();
  }
  process.exit(failed ? 1 : 0);
})();
