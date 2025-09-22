import prisma from "../lib/prisma.js";
import { Category } from "../generated/prisma/client.js";

interface FetchNewsFilters {
  category?: string | undefined;
  publisherName?: string | undefined;
}

function formatArticleForFrontend(news: any) {
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
  const whereClause: any = {};
  if (filters.category && filters.category.toUpperCase() in Category) {
    whereClause.category = filters.category.toUpperCase() as Category;
  }
  let publishers = await prisma.publisher.findMany();
  if (filters.publisherName) {
    publishers = publishers.filter((p) => p.name === filters.publisherName);
  }
  const allNews = [];
  for (const publisher of publishers) {
    const newsFromPublisher = await prisma.news.findMany({
      where: {
        ...whereClause,
        publisherId: publisher.id,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 3,
      include: {
        publisher: true,
      },
    });
    allNews.push(...newsFromPublisher);
  }
  allNews.sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime());
  return allNews.map(formatArticleForFrontend);
}

export async function fetchAvailableCategories() {
  const newsWithCategories = await prisma.news.findMany({
    distinct: ["category"],
    select: {
      category: true,
    },
  });
  return newsWithCategories.map((cat) => cat.category);
}
