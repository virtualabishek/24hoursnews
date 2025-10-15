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
    publishedAt: news.publishedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function fetchNews(filters: FetchNewsFilters) {
  const whereClause: Prisma.NewsWhereInput = {};

  if (filters.category && filters.category.toUpperCase() in Category) {
    whereClause.category = filters.category.toUpperCase() as Category;
  }

  if (filters.publisherName) {
    whereClause.publisher = {
      name: {
        contains: filters.publisherName,
      },
    };
  }

  if (filters.searchQuery && filters.searchQuery.trim()) {
    const searchTerm = filters.searchQuery.trim();
    whereClause.OR = [
      { nepaliTitle: { contains: searchTerm } },
      { englishTitle: { contains: searchTerm } },
      { nepaliDescription: { contains: searchTerm } },
      { englishDescription: { contains: searchTerm } },
      { publisher: { name: { contains: searchTerm } } },
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
    take: filters.limit || 200,
  });

  return allNews.map(formatArticleForFrontend);
}

export async function fetchAvailableCategories() {
  const newsWithCategories = await prisma.news.findMany({
    distinct: ["category"],
    select: {
      category: true,
    },
    where: {
      category: { notIn: [] },
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
