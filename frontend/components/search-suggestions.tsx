"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getAllCategories, searchArticles } from "@/lib/assets";

interface SearchSuggestionsProps {
  searchQuery: string;
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
}

export function SearchSuggestions({
  searchQuery,
  onSuggestionClick,
  isVisible,
}: SearchSuggestionsProps) {
  const { language, t } = useLanguage();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const categories = useMemo(() => getAllCategories(language), [language]);

  const popularSearches = {
    en: ["Gen Z Protest", "Technology", "International"],
    np: ["जेन जी आन्दोलन", "अन्तर्राष्ट्रिय", "प्रविधि"],
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions(popularSearches[language]);
      return;
    }

    const matchingArticles = searchArticles(searchQuery, language);
    const matchingSuggestions = new Set<string>();

    matchingArticles.forEach((article) => {
      if (article.publisher.toLowerCase().includes(searchQuery.toLowerCase())) {
        matchingSuggestions.add(article.publisher);
      }

      const heading =
        language === "en" ? article.engHeading : article.nepaliHeading;
      const words = heading
        .split(" ")
        .filter(
          (word) =>
            word.length > 3 &&
            word.toLowerCase().includes(searchQuery.toLowerCase())
        );
      words.forEach((word) => matchingSuggestions.add(word));
    });

    categories.forEach((category) => {
      if (category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        matchingSuggestions.add(category.name);
      }
    });

    setSuggestions(Array.from(matchingSuggestions).slice(0, 6));
  }, [searchQuery, language, categories]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border-border bg-card">
      <CardContent className="p-3">
        <div className="space-y-2">
          {!searchQuery.trim() && (
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {language === "en" ? "Popular Searches" : "लोकप्रिय खोजहरू"}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors duration-200 text-left"
              >
                <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
