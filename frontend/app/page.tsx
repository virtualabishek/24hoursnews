"use client";
import { useState, useMemo, useCallback } from "react";
import { Navigation } from "@/components/navigation";
import { NewsCarousel } from "@/components/news-carousel";
import { Footer } from "@/components/footer";
import { LanguageProvider, useLanguage } from "@/contexts/language-context";
import {
  getAllTopics,
  getArticlesByTopic,
  getTopicName,
  type TopicKey,
} from "@/lib/assets";

function NewsHomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { language, t } = useLanguage();
  const topics = getAllTopics();

  const filteredTopics = useMemo(() => {
    let filtered = topics.map((topicKey) => ({
      topicKey,
      articles: getArticlesByTopic(topicKey),
    }));

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (topic) => topic.topicKey === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered
        .map((topic) => ({
          ...topic,
          articles: topic.articles.filter((article) => {
            const engHeading = article.engHeading.toLowerCase();
            const nepaliHeading = article.nepaliHeading.toLowerCase();
            const engDescription = article.engDescription.toLowerCase();
            const nepaliDescription = article.nepaliDescription.toLowerCase();
            const publisher = article.publisher.toLowerCase();
            const topicName = getTopicName(
              topic.topicKey,
              language
            ).toLowerCase();

            return (
              engHeading.includes(searchLower) ||
              nepaliHeading.includes(searchLower) ||
              engDescription.includes(searchLower) ||
              nepaliDescription.includes(searchLower) ||
              publisher.includes(searchLower) ||
              topicName.includes(searchLower)
            );
          }),
        }))
        .filter((topic) => topic.articles.length > 0);
    }

    return filtered;
  }, [topics, searchQuery, selectedCategory, language]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryFilter = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
  }, []);

  const totalArticles = filteredTopics.reduce(
    (acc, topic) => acc + topic.articles.length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        selectedCategory={selectedCategory}
      />

      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Hero Section */}
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

          {!searchQuery && selectedCategory === "all" && (
            <div className="mt-6 sm:mt-8">
              <p className="text-sm sm:text-base text-muted-foreground">
                {language === "en"
                  ? `Featuring ${totalArticles}+ articles across ${topics.length} categories`
                  : `${topics.length} श्रेणीहरूमा ${totalArticles}+ लेखहरू प्रस्तुत गर्दै`}
              </p>
            </div>
          )}
        </div>

        {/* News Sections */}
        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {filteredTopics.length === 0 ? (
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
            filteredTopics.map((topic) => (
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

        {/* Enhanced Search Results Info */}
        {(searchQuery || selectedCategory !== "all") && (
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
                  ? `${totalArticles} articles found`
                  : `${totalArticles} लेखहरू फेला परे`}
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
