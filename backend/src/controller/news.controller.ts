import type { Request, Response } from "express";
import * as newsService from "../services/news.services.js";

interface FetchNewsFilters {
  category?: string;
  publisherName?: string;
}

export async function getNews(req: Request, res: Response) {
  try {
    const { category, publisher, search, limit } = req.query;

    // If search query is present, use search function
    if (search && typeof search === "string") {
      const results = await newsService.searchNews(
        search,
        limit ? parseInt(limit as string) : 50
      );
      return res.json(results);
    }

    // Otherwise use regular fetch with filters
    const news = await newsService.fetchNews({
      category: category as string | undefined,
      publisherName: publisher as string | undefined,
      searchQuery: search as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      error: "Failed to fetch news",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await newsService.fetchAvailableCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
