// SCHEDULER - FOR SCHEDULING ONE TIME AT THE 24 HOURS - FOR THE production

import cron from "node-cron";
import { ScrapingService } from "./services/scrapper.service.js";

export const startSchedulers = () => {
  cron.schedule(
    "0 2 * * *",
    () => {
      console.log("Running scheduled scrape job...");
      const scrapingService = new ScrapingService();
      scrapingService.runOnlineKhabarScrape().catch((error) => {
        console.error("Scheduled scrape failed:", error);
      });
    },
    {
      timezone: "Asia/Kathmandu",
    }
  );

  console.log("Cron job scheduled.");
};
