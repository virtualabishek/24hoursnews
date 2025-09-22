import cron from "node-cron";
import { ScrappingService } from "./services/scrapper.service.js";

export const startSchedulers = () => {
  if (process.env.NODE_ENV === "production") {
    console.log("Production environment detected. Scheduling cron jobs.");
    cron.schedule(
      "0 6,18 * * *",
      () => {
        console.log("Running scheduled scrape job (6 AM/6 PM)...");
        const scrapingService = new ScrappingService();
        scrapingService.runAllScraps().catch((error) => {
          console.error("Scheduled scrape failed:", error);
        });
      },
      {
        timezone: "Asia/Kathmandu",
      }
    );
  } else {
    console.log("Not in production environment. Cron jobs are disabled.");
  }
};
