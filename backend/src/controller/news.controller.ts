import type { Request, Response } from "express";
import * as newsService from "../services/news.services.js";

interface FetchNewsFilters {
  category?: string;
  publisherName?: string;
}

export const getNews = async (req: Request, res: Response) => {
  try {
    const categoryQuery = req.query.category as string | undefined;
    const publisherQuery = req.query.publisher as string | undefined;
    const filters: FetchNewsFilters = {};
    if (categoryQuery) {
      filters.category = categoryQuery;
    }
    if (publisherQuery) {
      filters.publisherName = publisherQuery;
    }
    const newsArticles = await newsService.fetchNews(filters);
    res.status(200).json(newsArticles);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    res.status(500).json({ message: "An error occurred while fetching news." });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await newsService.fetchAvailableCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching categories." });
  }
};
