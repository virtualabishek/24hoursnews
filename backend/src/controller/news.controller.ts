import type { Request, Response } from "express";
import * as newsService from "../services/news.services.js";

export const getNews = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const publisherName = req.query.publisher as string | undefined;
    const newsArticles = await newsService.fetchNews({
      category,
      publisherName,
    });
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
