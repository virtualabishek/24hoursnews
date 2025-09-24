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
  getAvailableCategories,
  groupArticlesByCategory,
} from "@/api/news-api";

function NewsHomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { language, t } = useLanguage();
  const [allArticles, setAllArticles] = useState<ApiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTopics, setAvailableTopics] = useState<TopicKey[]>([]);

  // Fetch all news on initial load
  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const articles = await fetchNews({});
        setAllArticles(articles);
      } catch (error) {
        console.error("Error loading news:", error);
        setAllArticles([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

  // Fetch categories for navigation
  useEffect(() => {
    getAvailableCategories().then(setAvailableTopics);
  }, []);

  // Fetch filtered news when category changes
  useEffect(() => {
    if (selectedCategory !== "all") {
      const loadFilteredNews = async () => {
        setIsLoading(true);
        try {
          const articles = await fetchNews({ category: selectedCategory });
          setAllArticles(articles);
        } catch (error) {
          console.error("Error loading filtered news:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadFilteredNews();
    }
  }, [selectedCategory]);

  const filteredArticles = allArticles;

  const carouselsToDisplay = useMemo(() => {
    const grouped = groupArticlesByCategory(allArticles);
    return Object.entries(grouped).map(([topicKey, articles]) => ({
      topicKey: topicKey as TopicKey,
      articles,
    }));
  }, [allArticles]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        setIsLoading(true);
        try {
          const articles = await fetchNews({ search: query });
          setAllArticles(articles);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset to show all articles when search is cleared
        const articles = await fetchNews({ category: selectedCategory });
        setAllArticles(articles);
      }
    },
    [selectedCategory]
  );

  const handleCategoryFilter = useCallback(async (category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
    setIsLoading(true);
    try {
      const articles = await fetchNews({
        category: category === "all" ? undefined : category,
      });
      setAllArticles(articles);
    } catch (error) {
      console.error("Error loading filtered news:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const totalArticlesFound = useMemo(() => allArticles.length, [allArticles]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        selectedCategory={selectedCategory}
        topics={availableTopics}
        allArticles={allArticles}
      />

      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight">
            {language === "en"
              ? "Stay Informed with Latest News"
              : "ताजा समाचारहरूसँग अपडेट रहनुहोस्"}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            {language === "en"
              ? "Get the latest news from Nepal and around the world in both English and Nepali languages. Stay connected with what matters most."
              : "नेपाल र विश्वभरका ताजा समाचारहरू अंग्रेजी र नेपाली दुवै भाषामा पाउनुहोस्। महत्वपूर्ण कुराहरूसँग जोडिएर रहनुहोस्।"}
          </p>
          {!searchQuery && selectedCategory === "all" && !isLoading && (
            <div className="mt-6 sm:mt-8">
              <p className="text-sm sm:text-base text-muted-foreground">
                {language === "en"
                  ? `Featuring ${totalArticlesFound} articles across ${availableTopics.length} categories`
                  : `${availableTopics.length} श्रेणीहरूमा ${totalArticlesFound} लेखहरू प्रस्तुत गर्दै`}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-lg font-semibold">{t("common.loading")}</p>
            </div>
          ) : carouselsToDisplay.length === 0 ? (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">📰</span>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3">
                {t("common.noResults")}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                {language === "en"
                  ? "Try adjusting your search or category filter to find more articles."
                  : "थप लेखहरू फेला पार्न आफ्नो खोज वा श्रेणी फिल्टर समायोजन गर्ने प्रयास गर्नुहोस्।"}
              </p>
            </div>
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

        {(searchQuery || selectedCategory !== "all") && !isLoading && (
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg border border-border backdrop-blur-sm">
            <div className="text-center space-y-2">
              {searchQuery && (
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "en"
                    ? `Search results for "${searchQuery}"`
                    : `"${searchQuery}" का लागि खोज परिणामहरू`}
                </p>
              )}
              {selectedCategory !== "all" && (
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "en"
                    ? `Filtered by category: ${getTopicName(
                        selectedCategory as TopicKey,
                        language
                      )}`
                    : `श्रेणी अनुसार फिल्टर गरिएको: ${getTopicName(
                        selectedCategory as TopicKey,
                        language
                      )}`}
                </p>
              )}
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
