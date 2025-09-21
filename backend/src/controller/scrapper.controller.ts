import type { Request, Response } from "express";
import { ScrapingService } from "../services/scrapper.service.js";

export const triggerScrape = (req: Request, res: Response) => {
  const secretKey = req.headers["x-scrape-secret"];

  if (
    process.env.NODE_ENV === "production" &&
    secretKey !== process.env.SCRAPE_SECRET_KEY
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(202).json({ message: "Scraping process initiated." });

  const scrapingService = new ScrapingService();
  scrapingService.runScrape().catch((error) => {
    console.error("Background scrape failed:", error);
  });
};
