import prisma from "../lib/prisma.js";
import { Category, Prisma } from "../generated/prisma/client.js";

interface FetchNewsFilters {
  category?: string | undefined;
  publisherName?: string | undefined;
  searchQuery?: string | undefined;
  limit?: number;
}

type NewsWithPublisher = Prisma.NewsGetPayload<{
  include: { publisher: true };
}>;

function formatArticleForFrontend(news: NewsWithPublisher) {
  return {
    id: news.id,
    engHeading: news.englishTitle || news.nepaliTitle,
    nepaliHeading: news.nepaliTitle,
    dateEnglish: news.dateEnglish,
    dateNepali: news.dateNepali,
    time: news.time,
    url: news.url,
    image_url: news.imageUrl,
    publisher: news.publisher.name,
    category: news.category || Category.GENERAL,
    engDescription:
      news.englishDescription ||
      news.nepaliDescription ||
      "No description available.",
    nepaliDescription:
      news.nepaliDescription || news.englishDescription || "विवरण उपलब्ध छैन।",
  };
}

export async function fetchNews(filters: FetchNewsFilters) {
  const whereClause: Prisma.NewsWhereInput = {};

  // Category filter
  if (filters.category && filters.category.toUpperCase() in Category) {
    whereClause.category = filters.category.toUpperCase() as Category;
  }

  // Publisher filter
  if (filters.publisherName) {
    whereClause.publisher = {
      name: {
        contains: filters.publisherName,
        mode: "insensitive",
      },
    };
  }

  // Search filter
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const searchTerm = filters.searchQuery.trim();
    whereClause.OR = [
      { nepaliTitle: { contains: searchTerm, mode: "insensitive" } },
      { englishTitle: { contains: searchTerm, mode: "insensitive" } },
      { nepaliDescription: { contains: searchTerm, mode: "insensitive" } },
      { englishDescription: { contains: searchTerm, mode: "insensitive" } },
      { publisher: { name: { contains: searchTerm, mode: "insensitive" } } },
    ];
  }

  const allNews = await prisma.news.findMany({
    where: whereClause,
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      publisher: true,
    },
    take: filters.limit || (filters.category ? 20 : 200), // Limit results
  });

  // If specific category is requested, return limited results
  if (filters.category && filters.category !== "all") {
    return allNews.slice(0, 20).map(formatArticleForFrontend);
  }

  // For "all" categories, group by category and limit each
  if (!filters.searchQuery) {
    const groupedByCategory: Record<Category, NewsWithPublisher[]> =
      {} as Record<Category, NewsWithPublisher[]>;

    allNews.forEach((news) => {
      const cat = news.category || Category.GENERAL;
      if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
      if (groupedByCategory[cat].length < 15) {
        // Limit to 15 per category
        groupedByCategory[cat].push(news);
      }
    });

    const finalNews = Object.values(groupedByCategory).flat();
    return finalNews.map(formatArticleForFrontend);
  }

  // For search results, return all matching
  return allNews.map(formatArticleForFrontend);
}

export async function fetchAvailableCategories() {
  const newsWithCategories = await prisma.news.findMany({
    distinct: ["category"],
    select: {
      category: true,
    },
    where: {
      category: { not: null },
    },
    orderBy: {
      category: "asc",
    },
  });

  const categories = newsWithCategories
    .map((item) => item.category)
    .filter((c): c is Category => c !== null);

  return categories.length > 0 ? categories : [Category.GENERAL];
}

export async function searchNews(query: string, limit: number = 50) {
  return fetchNews({ searchQuery: query, limit });
}
