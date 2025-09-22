import type { Request, Response } from "express";
import * as newsService from "../services/news.services.js";

export const getNews = async (req: Request, res: Response) => {
  try {
    // Extract optional filters from the query string
    const category = req.query.category as string | undefined;
    const publisherName = req.query.publisher as string | undefined;

    // Call the service with the filters
    const newsArticles = await newsService.fetchNews({
      category,
      publisherName,
    });

    // Send the formatted data to the frontend
    res.status(200).json(newsArticles);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    res.status(500).json({ message: "An error occurred while fetching news." });
  }
};
