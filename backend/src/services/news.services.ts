import prisma from "../lib/prisma.js";
import { Category, Prisma } from "../../lib/generated/prisma/client.js";

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
  const { category, publisherName, searchQuery, limit } = filters;

  if (searchQuery) {
    const searchTerm = searchQuery.trim();

    const categoryMatch = Object.values(Category).find((cat) =>
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const where: Prisma.NewsWhereInput = {
      OR: [
        { nepaliTitle: { contains: searchTerm } },
        { englishTitle: { contains: searchTerm } },
        { nepaliDescription: { contains: searchTerm } },
        { englishDescription: { contains: searchTerm } },
        { publisher: { name: { contains: searchTerm } } },
      ],
    };
    if (categoryMatch) {
      where.OR?.push({ category: categoryMatch });
    }

    if (category && category.toUpperCase() in Category) {
      where.category = category.toUpperCase() as Category;
    }

    const news = await prisma.news.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: { publisher: true },
      take: limit || 100,
    });
    return news.map(formatArticleForFrontend);
  }

  if (category) {
    const whereClause: Prisma.NewsWhereInput = {
      category: category.toUpperCase() as Category,
    };
    const news = await prisma.news.findMany({
      where: whereClause,
      orderBy: { publishedAt: "desc" },
      include: { publisher: true },
      take: limit || 200,
    });
    return news.map(formatArticleForFrontend);
  }

  console.log("Fetching top articles for each category for the homepage...");
  const categories = await fetchAvailableCategories();
  const articlesPerCategory = 15;
  let allCategorizedNews: NewsWithPublisher[] = [];

  for (const cat of categories) {
    const newsInCategory = await prisma.news.findMany({
      where: { category: cat },
      orderBy: { publishedAt: "desc" },
      include: { publisher: true },
      take: articlesPerCategory,
    });
    allCategorizedNews.push(...newsInCategory);
  }
  allCategorizedNews.sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
  );

  return allCategorizedNews.map(formatArticleForFrontend);
}
export async function fetchAvailableCategories() {
  const newsWithCategories = await prisma.news.findMany({
    distinct: ["category"],
    select: { category: true },
    where: { category: { notIn: [] } },
    orderBy: { category: "asc" },
  });

  const categories = newsWithCategories
    .map((item: { category: Category | null }) => item.category)
    .filter((c: Category | null): c is Category => c !== null);

  return categories.length > 0 ? categories : [Category.GENERAL];
}

export async function searchNews(query: string, limit: number = 50) {
  return fetchNews({ searchQuery: query, limit });
}
