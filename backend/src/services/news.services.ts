import { and, asc, desc, eq, like, or, type SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  Category,
  categoryValues,
  news,
  publishers,
  type NewsWithPublisher,
} from "../db/schema.js";

interface FetchNewsFilters {
  category?: string | undefined;
  publisherName?: string | undefined;
  searchQuery?: string | undefined;
  limit?: number;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

function likePattern(term: string): string {
  return `%${escapeLike(term)}%`;
}

function toCategory(value: string | undefined) {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  return (categoryValues as readonly string[]).includes(upper)
    ? (upper as (typeof categoryValues)[number])
    : undefined;
}

function formatArticleForFrontend(item: NewsWithPublisher) {
  return {
    id: item.id,
    engHeading: item.englishTitle || item.nepaliTitle,
    nepaliHeading: item.nepaliTitle,
    dateEnglish: item.dateEnglish,
    dateNepali: item.dateNepali,
    time: item.time,
    url: item.url,
    image_url: item.imageUrl,
    publisher: item.publisher.name,
    category: item.category || Category.GENERAL,
    engDescription:
      item.englishDescription ||
      item.nepaliDescription ||
      "No description available.",
    nepaliDescription:
      item.nepaliDescription || item.englishDescription || "विवरण उपलब्ध छैन।",
    publishedAt: item.publishedAt?.toISOString() || new Date().toISOString(),
  };
}

type ArticleRow = ReturnType<typeof formatArticleForFrontend>;

async function findManyWithPublisher(options: {
  where?: SQL | undefined;
  limit?: number;
}): Promise<NewsWithPublisher[]> {
  const rows = await db
    .select({ news, publisher: publishers })
    .from(news)
    .leftJoin(publishers, eq(news.publisherId, publishers.id))
    .where(options.where)
    .orderBy(desc(news.publishedAt))
    .limit(options.limit ?? 100);

  return rows.flatMap((row) =>
    row.publisher ? [{ ...row.news, publisher: row.publisher }] : [],
  );
}

export async function fetchNews(
  filters: FetchNewsFilters,
): Promise<ArticleRow[]> {
  const { category, publisherName, searchQuery, limit } = filters;

  if (searchQuery) {
    const searchTerm = searchQuery.trim();

    const categoryMatch = Object.values(Category).find((cat) =>
      cat.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const pattern = likePattern(searchTerm);
    const searchOr = or(
      like(news.nepaliTitle, pattern),
      like(news.englishTitle, pattern),
      like(news.nepaliDescription, pattern),
      like(news.englishDescription, pattern),
      like(publishers.name, pattern),
      categoryMatch ? eq(news.category, categoryMatch) : undefined,
    );

    const categoryFilter = toCategory(category);
    const publisherFilter = publisherName?.trim()
      ? like(publishers.name, likePattern(publisherName.trim()))
      : undefined;

    const where = and(searchOr, categoryFilter ? eq(news.category, categoryFilter) : undefined, publisherFilter);

    const items = await findManyWithPublisher({
      where,
      limit: limit || 100,
    });
    return items.map(formatArticleForFrontend);
  }

  if (category || publisherName) {
    const categoryFilter = toCategory(category);
    // Preserve old behavior: unknown category string passes through as-is
    // would match nothing; keep that by using raw value cast.
    const effectiveCategory = categoryFilter ?? (category ? (category.toUpperCase() as (typeof categoryValues)[number]) : undefined);
    const publisherFilter = publisherName?.trim()
      ? like(publishers.name, likePattern(publisherName.trim()))
      : undefined;

    const items = await findManyWithPublisher({
      where: and(
        effectiveCategory ? eq(news.category, effectiveCategory) : undefined,
        publisherFilter,
      ),
      limit: limit || 200,
    });
    return items.map(formatArticleForFrontend);
  }

  console.log("Fetching top articles for each category for the homepage...");
  const categories = await fetchAvailableCategories();
  const articlesPerCategory = 15;
  let allCategorizedNews: NewsWithPublisher[] = [];

  for (const cat of categories) {
    const newsInCategory = await findManyWithPublisher({
      where: eq(news.category, cat),
      limit: articlesPerCategory,
    });
    allCategorizedNews.push(...newsInCategory);
  }
  allCategorizedNews.sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
  );

  return allCategorizedNews.map(formatArticleForFrontend);
}

export async function fetchAvailableCategories() {
  const rows = await db
    .selectDistinct({ category: news.category })
    .from(news)
    .orderBy(asc(news.category));

  const categories = rows
    .map((item) => item.category)
    .filter((c): c is (typeof categoryValues)[number] => c !== null);

  return categories.length > 0 ? categories : [Category.GENERAL];
}

export async function searchNews(query: string, limit: number = 50) {
  return fetchNews({ searchQuery: query, limit });
}
