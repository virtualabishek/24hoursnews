import localizationData from "@/data/localization.json";
import newsData from "@/data/news-data.json";

export type Language = "en" | "np";

export interface NewsArticle {
  id: string;
  engHeading: string;
  nepaliHeading: string;
  engDescription: string;
  nepaliDescription: string;
  dateEnglish: string;
  dateNepali: string;
  url: string;
  image_url: string;
  publisher: string;
}

export type TopicKey =
  | "gen-protest"
  | "corruption"
  | "sports"
  | "share-market"
  | "technology"
  | "tourism"
  | "education"
  | "entertainment"
  | "health"
  | "climate-change";

export function getLocalization(language: Language) {
  console.log("[v0] localizationData:", localizationData);
  console.log("[v0] language:", language);
  console.log("[v0] localizationData[language]:", localizationData[language]);

  if (!localizationData || !localizationData[language]) {
    console.error("[v0] Localization data not found for language:", language);
    return {
      navigation: {
        search: "Search...",
        allCategories: "All Categories",
        language: "Language",
        theme: "Theme",
      },
      categories: {
        "hot-topic": "Hot Topic: Gen Z Protest",
        corruption: "Corruption",
        sports: "Sports",
        "share-market": "Share Market",
        technology: "Technology",
        tourism: "Tourism",
        education: "Education",
        entertainment: "Entertainment",
        health: "Health",
        "climate-change": "Climate Change",
      },
      common: {
        readMore: "Read More",
        noResults: "No results found",
        loading: "Loading...",
        publishedOn: "Published on",
      },
      footer: {
        madeBy: "Made by",
        company: "AstaVision Infosys",
        allRightsReserved: "All rights reserved.",
      },
    };
  }

  return localizationData[language];
}

export function getAllTopics(): TopicKey[] {
  console.log("[v0] newsData:", newsData);
  return Object.keys(newsData) as TopicKey[];
}

export function getAllCategories(
  language: Language
): Array<{ key: TopicKey; name: string; articles: NewsArticle[] }> {
  const translations = getLocalization(language);

  if (!translations || !translations.categories) {
    return [];
  }

  return getAllTopics().map((topic) => ({
    key: topic,
    name:
      translations.categories[topic === "gen-protest" ? "hot-topic" : topic] ||
      topic,
    articles: getArticlesByTopic(topic),
  }));
}

export function getTopicName(topic: TopicKey, language: Language): string {
  const translations = getLocalization(language);
  const categoryKey = topic === "gen-protest" ? "hot-topic" : topic;
  return translations.categories[categoryKey] || topic;
}

export function isHotTopic(topic: TopicKey): boolean {
  return topic === "gen-protest";
}

export function getArticlesByTopic(topic: TopicKey): NewsArticle[] {
  return newsData[topic] || [];
}

export function getAllArticles(): NewsArticle[] {
  return getAllTopics().flatMap((topic) => getArticlesByTopic(topic));
}

export function searchArticles(
  query: string,
  language: Language
): NewsArticle[] {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase();
  const allArticles = getAllArticles();

  return allArticles.filter((article) => {
    const heading =
      language === "en" ? article.engHeading : article.nepaliHeading;
    const description =
      language === "en" ? article.engDescription : article.nepaliDescription;

    return (
      heading.toLowerCase().includes(searchTerm) ||
      description.toLowerCase().includes(searchTerm) ||
      article.publisher.toLowerCase().includes(searchTerm)
    );
  });
}

export function filterArticlesByTopic(
  articles: NewsArticle[],
  topic: TopicKey | "all"
): NewsArticle[] {
  if (topic === "all") return articles;
  return getArticlesByTopic(topic);
}
