"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, Sun, Moon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchSuggestions } from "./search-suggestions";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/language-context";
import { getTopicName, type TopicKey } from "@/lib/assets";
import { useDebounce } from "@/hooks/use-debounce";
import { ApiArticle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

interface NavigationProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  selectedCategory: string;
  topics: TopicKey[];
  allArticles: ApiArticle[];
}

export function Navigation({
  onSearch,
  onCategoryFilter,
  selectedCategory,
  topics,
  allArticles,
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleCategoryClick = (category: string) => {
    setSearchQuery("");
    onCategoryFilter(category);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "np" : "en");
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="mx-8 hidden max-w-2xl flex-1 items-center space-x-4 lg:flex">
            {/* Search Bar */}
            <div ref={searchRef} className="relative flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("navigation.search")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="w-full pl-10 pr-4 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
              </form>
              <SearchSuggestions
                searchQuery={searchQuery}
                onSuggestionClick={handleSuggestionClick}
                isVisible={showSuggestions}
                articles={allArticles}
                categories={topics.map((t) => ({
                  key: t,
                  name: getTopicName(t, language),
                }))}
              />
            </div>

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* UPDATED: Added proper hover classes */}
                <button className="inline-flex h-10 min-w-[140px] items-center justify-between rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-300 hover:bg-accent hover:text-accent-foreground">
                  <span className="truncate">
                    {selectedCategory === "all"
                      ? t("navigation.allCategories")
                      : getTopicName(selectedCategory as TopicKey, language)}
                  </span>
                  <Filter className="ml-2 h-4 w-4 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => handleCategoryClick("all")}
                  className={cn(selectedCategory === "all" && "bg-accent")}
                >
                  {t("navigation.allCategories")}
                </DropdownMenuItem>
                {topics.map((topicKey) => (
                  <DropdownMenuItem
                    key={topicKey}
                    onClick={() => handleCategoryClick(topicKey)}
                    className={cn(selectedCategory === topicKey && "bg-accent")}
                  >
                    {getTopicName(topicKey, language)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden min-w-[60px] justify-center transition-colors duration-300 hover:bg-accent hover:text-accent-foreground sm:flex"
              title={
                language === "en" ? "Switch to Nepali" : "Switch to English"
              }
            >
              {language === "en" ? (
                <div className="flex items-center space-x-1">
                  <span className="text-sm">🇳🇵</span>
                  <span className="font-nepali text-xs font-medium">नेप</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <span className="text-sm">🇺🇸</span>
                  <span className="text-xs font-medium">EN</span>
                </div>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="min-w-[40px] justify-center transition-colors duration-300 hover:bg-accent hover:text-accent-foreground"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="transition-colors duration-300 hover:bg-accent hover:text-accent-foreground lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-300">
            <div ref={searchRef} className="mb-4 relative">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                <Input
                  type="text"
                  placeholder={t("navigation.search")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="pl-10 pr-4 w-full"
                />
              </form>
              <SearchSuggestions
                searchQuery={searchQuery}
                onSuggestionClick={handleSuggestionClick}
                isVisible={showSuggestions}
                articles={allArticles}
                categories={topics.map((t) => ({
                  key: t,
                  name: getTopicName(t, language),
                }))}
              />
            </div>

            {/* Mobile Category Filter */}
            <div className="mb-4">
              <p className="text-sm font-medium text-foreground mb-3">
                {t("navigation.allCategories")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryClick("all")}
                  className="justify-start text-left"
                >
                  {t("navigation.allCategories")}
                </Button>
                {topics.map((topicKey) => (
                  <Button
                    key={topicKey}
                    variant={
                      selectedCategory === topicKey ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleCategoryClick(topicKey)}
                    className="justify-start text-left text-xs sm:text-sm"
                  >
                    {getTopicName(topicKey, language)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mobile Language & Theme Toggles */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Language:
                  </span>
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("en")}
                    className="min-w-[50px]"
                  >
                    🇺🇸 EN
                  </Button>
                  <Button
                    variant={language === "np" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("np")}
                    className="min-w-[50px]"
                  >
                    🇳🇵 नेप
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Theme:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className="min-w-[40px] bg-transparent"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
