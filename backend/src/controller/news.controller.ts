import type { Request, Response } from "express";
import * as newsService from "../services/news.services.js";

export async function getNews(req: Request, res: Response) {
  try {
    const { category, publisher, search, limit } = req.query;

    // Clamp: positive int, max 100 — prevents huge queries from ?limit=999999.
    const rawLimit = limit ? parseInt(limit as string) : NaN;
    const parsedLimit =
      !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : undefined;

    if (search && typeof search === "string") {
      const results = await newsService.searchNews(search, parsedLimit || 50);
      return res.json(results);
    }

    const filters: {
      category?: string;
      publisherName?: string;
      searchQuery?: string;
      limit?: number;
    } = {};

    if (category && typeof category === "string") {
      filters.category = category;
    }

    if (publisher && typeof publisher === "string") {
      filters.publisherName = publisher;
    }

    if (search && typeof search === "string") {
      filters.searchQuery = search;
    }

    if (parsedLimit !== undefined && !isNaN(parsedLimit)) {
      filters.limit = parsedLimit;
    }

    const news = await newsService.fetchNews(filters);

    res.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      error: "Failed to fetch news",
      ...(process.env.NODE_ENV === "production"
        ? {}
        : { message: error instanceof Error ? error.message : "Unknown error" }),
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
      ...(process.env.NODE_ENV === "production"
        ? {}
        : { message: error instanceof Error ? error.message : "Unknown error" }),
    });
  }
}
