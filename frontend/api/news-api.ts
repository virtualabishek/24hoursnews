// api/news-api.ts
import { ApiArticle } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchFilters {
  category?: string;
  publisher?: string;
}

/**
 * Infer category from article URL patterns
 * This is needed because the API doesn't always return a category field
 */
function inferCategoryFromArticle(article: any): string {
  const url = article.url?.toLowerCase() || "";

  // Check URL patterns for category inference
  if (url.includes("/politics/")) return "POLITICS";
  if (
    url.includes("/kinmel/") ||
    url.includes("/banking/") ||
    url.includes("/economy/")
  )
    return "BUSINESS";
  if (url.includes("/technology/") || url.includes("/tech/"))
    return "TECHNOLOGY";
  if (url.includes("/sports/")) return "SPORTS";
  if (url.includes("/health/")) return "HEALTH";
  if (url.includes("/education/")) return "EDUCATION";
  if (url.includes("/entertainment/")) return "ENTERTAINMENT";
  if (url.includes("/international/")) return "INTERNATIONAL";
  if (url.includes("/lifestyle/")) return "LIFESTYLE";
  if (url.includes("/national/")) return "NATIONAL";
  if (url.includes("/opinion/")) return "OPINION";
  if (url.includes("/tourism/")) return "BUSINESS";

  if (article.publisher?.toLowerCase().includes("share")) return "MERO_SHARE";

  return "GENERAL";
}

export async function fetchNews(
  filters: FetchFilters = {}
): Promise<ApiArticle[]> {
  const queryParams = new URLSearchParams();

  if (filters.category && filters.category !== "all") {
    queryParams.append("category", filters.category.toUpperCase());
  }

  if (filters.publisher) {
    queryParams.append("publisher", filters.publisher);
  }

  const url = `${API_BASE_URL}/api/news${
    queryParams.toString() ? "?" + queryParams.toString() : ""
  }`;
  console.log("Fetching from URL:", url);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    return data.map((article: any) => ({
      ...article,
      id: article.id?.toString() || Math.random().toString(36).substr(2, 9),

      category: article.category || inferCategoryFromArticle(article),

      engDescription: article.engDescription || "No description available.",
      nepaliDescription: article.nepaliDescription || "विवरण उपलब्ध छैन।",

      dateEnglish:
        article.dateEnglish || new Date().toISOString().split("T")[0],
      dateNepali: article.dateNepali || "",
      timeEnglish: article.timeEnglish || "",
      timeNepali: article.timeNepali || "",

      image_url: article.image_url || null,
      publisher: article.publisher || "Unknown",
      url: article.url || "#",
    }));
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

export async function getAvailableCategories(): Promise<string[]> {
  try {
    const articles = await fetchNews();
    const categories = new Set<string>();

    articles.forEach((article) => {
      if (article.category) {
        categories.add(article.category);
      }
    });

    return Array.from(categories).sort();
  } catch (error) {
    console.error("Failed to get categories:", error);
    return ["POLITICS", "BUSINESS", "TECHNOLOGY", "SPORTS", "GENERAL"];
  }
}

export function searchArticles(
  articles: ApiArticle[],
  query: string
): ApiArticle[] {
  if (!query.trim()) return articles;

  const searchLower = query.toLowerCase();

  return articles.filter((article) => {
    const englishMatch =
      article.engHeading?.toLowerCase().includes(searchLower) ||
      article.engDescription?.toLowerCase().includes(searchLower);

    const nepaliMatch =
      article.nepaliHeading?.toLowerCase().includes(searchLower) ||
      article.nepaliDescription?.toLowerCase().includes(searchLower);

    const metaMatch =
      article.publisher?.toLowerCase().includes(searchLower) ||
      article.category?.toLowerCase().includes(searchLower);

    return englishMatch || nepaliMatch || metaMatch;
  });
}

export function groupArticlesByCategory(
  articles: ApiArticle[]
): Record<string, ApiArticle[]> {
  return articles.reduce((acc, article) => {
    const category = article.category || "GENERAL";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(article);
    return acc;
  }, {} as Record<string, ApiArticle[]>);
}
