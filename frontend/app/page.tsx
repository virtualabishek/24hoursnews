// app/page.tsx

"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Navigation } from "@/components/navigation";
import { NewsCarousel } from "@/components/news-carousel";
import { Footer } from "@/components/footer";
import { LanguageProvider, useLanguage } from "@/contexts/language-context";
import { getTopicName, type TopicKey } from "@/lib/assets";
import { ApiArticle } from "@/lib/types";
import {
  fetchNews,
  groupArticlesByCategory,
  searchArticles,
  getAvailableCategories,
} from "@/api/news-api";

function NewsHomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { language, t } = useLanguage();
  const [allArticles, setAllArticles] = useState<ApiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTopics, setAvailableTopics] = useState<TopicKey[]>([]);

  // Effect to fetch all possible categories for the navigation dropdown
  useEffect(() => {
    getAvailableCategories().then((topics) => {
      setAvailableTopics(topics);
    });
  }, []); // Runs only once

  // Effect to fetch news articles based on the current filter
  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      // The API is now responsible for the filtering
      const articles = await fetchNews({ category: selectedCategory });
      setAllArticles(articles);
      setIsLoading(false);
    };
    loadNews();
  }, [selectedCategory]); // Re-fetches when the category changes

  // 1. Apply the search query to the currently loaded articles
  const filteredArticles = useMemo(() => {
    return searchArticles(allArticles, searchQuery);
  }, [allArticles, searchQuery]);

  // 2. Group the search results by category
  const carouselsToDisplay = useMemo(() => {
    const grouped = groupArticlesByCategory(filteredArticles);
    return Object.entries(grouped).map(([topicKey, articles]) => ({
      topicKey: topicKey as TopicKey,
      articles,
    }));
  }, [filteredArticles]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  const handleCategoryFilter = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
  }, []);

  const totalArticlesFound = useMemo(
    () => filteredArticles.length,
    [filteredArticles]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        selectedCategory={selectedCategory}
        topics={availableTopics}
        allArticles={allArticles} // Pass original unfiltered articles to search suggestions
      />

      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          {/* ... h1 and p tags ... */}
          {!searchQuery && selectedCategory === "all" && !isLoading && (
            <div className="mt-6 sm:mt-8">
              <p className="text-sm sm:text-base text-muted-foreground">
                {language === "en"
                  ? `Featuring articles across ${availableTopics.length} categories`
                  : `${availableTopics.length} श्रेणीहरूमा लेखहरू प्रस्तुत गर्दै`}
              </p>
            </div>
          )}
        </div>

        {/* News Sections */}
        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {isLoading ? (
            <div className="text-center py-20">
              {" "}
              <p>{t("common.loading")}</p>{" "}
            </div>
          ) : carouselsToDisplay.length === 0 ? (
            <div className="text-center py-12">{/* No Results View */}</div>
          ) : (
            carouselsToDisplay.map((topic) => (
              <section key={topic.topicKey} className="space-y-4 sm:space-y-6">
                <NewsCarousel
                  articles={topic.articles}
                  title={getTopicName(topic.topicKey, language)}
                  topicKey={topic.topicKey}
                />
              </section>
            ))
          )}
        </div>

        {/* Search Results Info */}
        {(searchQuery || selectedCategory !== "all") && !isLoading && (
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg border">
            <div className="text-center space-y-2">
              {/* ... */}
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {language === "en"
                  ? `${totalArticlesFound} articles found`
                  : `${totalArticlesFound} लेखहरू फेला परे`}
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <LanguageProvider>
      <NewsHomePage />
    </LanguageProvider>
  );
}
