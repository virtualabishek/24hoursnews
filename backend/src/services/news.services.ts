import prisma from "../lib/prisma.js";
import { Category, Prisma } from "../generated/prisma/client.js";

interface FetchNewsFilters {
  category?: string | undefined;
  publisherName?: string | undefined;
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
  const isCategoryFilterActive =
    filters.category && filters.category.toUpperCase() in Category;

  if (isCategoryFilterActive) {
    whereClause.category = filters.category!.toUpperCase() as Category;
  }

  const allNews = await prisma.news.findMany({
    where: {
      ...whereClause,
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      publisher: true,
    },
  });

  if (isCategoryFilterActive) {
    allNews.sort(
      (a: NewsWithPublisher, b: NewsWithPublisher) =>
        b.publishedAt!.getTime() - a.publishedAt!.getTime()
    );
    return allNews.slice(0, 20).map(formatArticleForFrontend); // Limit to 20 for specific
  }

  // For "all", group by category and limit to 15 latest per category
  const groupedByCategory: Record<Category, NewsWithPublisher[]> = {} as Record<
    Category,
    NewsWithPublisher[]
  >;
  allNews.forEach((news) => {
    const cat = news.category || Category.GENERAL;
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(news);
  });

  // Sort each category by publishedAt and limit to 15
  Object.keys(groupedByCategory).forEach((catKey) => {
    const cat = catKey as Category;
    groupedByCategory[cat].sort(
      (a: NewsWithPublisher, b: NewsWithPublisher) =>
        b.publishedAt!.getTime() - a.publishedAt!.getTime()
    );
    groupedByCategory[cat] = groupedByCategory[cat].slice(0, 15);
  });

  // Flatten all limited categories
  const finalNews = Object.values(groupedByCategory).flat();

  return finalNews.map(formatArticleForFrontend);
}

export async function fetchAvailableCategories() {
  // Fetch all distinct categories without where clause to avoid type error
  const newsWithCategories = await prisma.news.findMany({
    distinct: ["category"],
    select: {
      category: true,
    },
    orderBy: {
      category: "asc",
    },
  });

  // Filter null in JS to avoid Prisma type issue
  const categories = newsWithCategories
    .map((item) => item.category)
    .filter((c): c is Category => c !== null)
    .sort() || [Category.GENERAL];

  return categories;
}
