import cron from "node-cron";
import { ScrappingService } from "./services/scrapper.service.js";
import { cleanupOldArticles } from "./services/cleanup.service.js";

// Retention policy: nothing older than 7 days stays in the DB.
// - Every scrape also prunes its own publisher+category slice older than 7 days
//   (see ScrappingService.replaceNewsInCategory).
// - This hourly job is the backstop: it deletes ANY article older than 7 days.
const DAYS_TO_KEEP = 7;

export const startSchedulers = () => {
  if (process.env.DISABLE_SCHEDULER === "true") {
    console.log(
      "Scheduler disabled via DISABLE_SCHEDULER=true (use an external cron hitting POST /api/scraper/start instead).",
    );
    return;
  }
  if (process.env.NODE_ENV === "production") {
    console.log(
      `Production environment detected. Scheduling hourly scrape + ${DAYS_TO_KEEP}-day cleanup.`,
    );
    let isRunning = false;
    cron.schedule(
      "0 * * * *",
      async () => {
        if (isRunning) {
          console.log(
            "Previous hourly job still running, skipping this tick.",
          );
          return;
        }
        isRunning = true;
        console.log("Running scheduled hourly job: cleanup + scrape...");
        try {
          await cleanupOldArticles(DAYS_TO_KEEP);
          const scrapingService = new ScrappingService();
          await scrapingService.runAllScraps();
        } catch (error) {
          console.error("Scheduled hourly job failed:", error);
        } finally {
          isRunning = false;
        }
      },
      {
        timezone: "Asia/Kathmandu",
      },
    );
  } else {
    console.log("Not in production environment. Cron jobs are disabled.");
  }
};
