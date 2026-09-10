import { ApiArticle } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "production"
    ? "https://newsapi.bhagawatin.com.np"
    : "http://localhost:3001");

// Shared secret with the backend (must match backend API_KEY).
// Ships in browser JS, so it stops hotlinking/casual abuse — not targeted extraction.
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

function apiHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(API_KEY ? { "x-api-key": API_KEY } : {}),
  };
}

interface FetchFilters {
  category?: string;
  publisher?: string;
  search?: string;
}

export async function fetchNews(
  filters: FetchFilters = {}
): Promise<ApiArticle[]> {
  const queryParams = new URLSearchParams();

  if (
    filters.category &&
    filters.category !== "all" &&
    filters.category !== ""
  ) {
    queryParams.append("category", filters.category.toUpperCase());
  }

  if (
    filters.publisher &&
    filters.publisher !== "all" &&
    filters.publisher !== ""
  ) {
    queryParams.append("publisher", filters.publisher);
  }

  if (filters.search && filters.search.trim()) {
    // Send search query as-is, backend will handle it
    queryParams.append("search", filters.search.trim());
  }

  const url = `${API_BASE_URL}/api/news${queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: apiHeaders(),
    });

    if (!response.ok) {
      console.error(`API call failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Invalid response format:", data);
      return [];
    }

    const articles = data.map((article: any) => ({
      id: article.id?.toString() || Math.random().toString(36).substr(2, 9),
      engHeading: article.engHeading || article.engTitle || "No Title",
      nepaliHeading:
        article.nepaliHeading || article.nepaliTitle || "शीर्षक छैन",
      category: article.category || "GENERAL",
      engDescription: article.engDescription || "No description available.",
      nepaliDescription: article.nepaliDescription || "विवरण उपलब्ध छैन।",
      dateEnglish:
        article.dateEnglish || new Date().toISOString().split("T")[0],
      dateNepali: article.dateNepali || "",
      time: article.time || "",
      image_url: article.image_url || null,
      publisher: article.publisher || "Unknown",
      url: article.url || "#",
      publishedAt:
        article.publishedAt || article.dateEnglish || new Date().toISOString(),
    }));

    console.log(`Fetched ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

export async function getAvailableCategories(): Promise<string[]> {
  const url = `${API_BASE_URL}/api/news/categories`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: apiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Categories received:", data);

    return Array.isArray(data) ? data : ["GENERAL"];
  } catch (error) {
    console.error("Failed to get categories:", error);
    return [
      "POLITICS",
      "BUSINESS",
      "TECHNOLOGY",
      "SPORTS",
      "HEALTH",
      "EDUCATION",
      "ENTERTAINMENT",
      "INTERNATIONAL",
      "LIFESTYLE",
      "NATIONAL",
      "OPINION",
      "GENERAL",
    ];
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
      article.nepaliHeading?.includes(query) ||
      article.nepaliDescription?.includes(query);

    const metaMatch =
      article.publisher?.toLowerCase().includes(searchLower) ||
      article.category?.toLowerCase().includes(searchLower);

    return englishMatch || nepaliMatch || metaMatch;
  });
}

export function groupArticlesByCategory(
  articles: ApiArticle[]
): Record<string, ApiArticle[]> {
  const grouped: Record<string, ApiArticle[]> = {};
  articles.forEach((article) => {
    const category = article.category || "GENERAL";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(article);
  });

  // Sort each category's articles by publishedAt (newest first)
  Object.keys(grouped).forEach((category) => {
    grouped[category].sort((a, b) => {
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });
  });

  return grouped;
}
