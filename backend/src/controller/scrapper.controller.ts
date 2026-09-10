import type { Request, Response } from "express";
import { ScrappingService } from "../services/scrapper.service.js";

export const triggerScrape = (req: Request, res: Response) => {
  const secretKey = req.headers["x-scrape-secret"];
  const expected = process.env.SCRAPE_SECRET_KEY;

  // Fail closed: missing secret on the server denies everything (an unset
  // env would otherwise compare undefined !== undefined and let anyone in).
  if (
    process.env.NODE_ENV === "production" &&
    (!expected || secretKey !== expected)
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(202).json({ message: "Scraping process initiated." });

  const scrapingService = new ScrappingService();
  scrapingService.runAllScraps().catch((error) => {
    console.error("Background scrape failed:", error);
  });
};
