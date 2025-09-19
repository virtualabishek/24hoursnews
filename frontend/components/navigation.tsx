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
import { getAllTopics, getTopicName, type TopicKey } from "@/lib/assets";
import { useDebounce } from "@/hooks/use-debounce";

interface NavigationProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  selectedCategory: string;
}

export function Navigation({
  onSearch,
  onCategoryFilter,
  selectedCategory,
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const topics = getAllTopics();
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onSearch(debouncedSearchQuery);
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "np" : "en");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs">🇳🇵</span>
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                24 Hours News
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {language === "en"
                  ? "Latest News in English & Nepali"
                  : "अंग्रेजी र नेपालीमा ताजा समाचार"}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-2xl mx-8">
            {/* Search Bar with Suggestions */}
            <div ref={searchRef} className="flex-1 relative">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                <Input
                  type="text"
                  placeholder={t("navigation.search")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="pl-10 pr-4 w-full focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </form>
              <SearchSuggestions
                searchQuery={searchQuery}
                onSuggestionClick={handleSuggestionClick}
                isVisible={showSuggestions}
              />
            </div>

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[140px] justify-between bg-transparent hover:bg-muted/50 transition-colors duration-300"
                >
                  <span className="truncate"> 
                    {selectedCategory === "all"
                      ? t("navigation.allCategories")
                      : getTopicName(selectedCategory as TopicKey, language)}
                  </span>
                  <Filter className="w-4 h-4 ml-2 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => onCategoryFilter("all")}
                  className={selectedCategory === "all" ? "bg-primary/10" : ""}
                >
                  {t("navigation.allCategories")}
                </DropdownMenuItem>
                {topics.map((topicKey) => (
                  <DropdownMenuItem
                    key={topicKey}
                    onClick={() => onCategoryFilter(topicKey)}
                    className={
                      selectedCategory === topicKey ? "bg-primary/10" : ""
                    }
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
              className="hidden sm:flex hover:bg-muted/50 transition-colors duration-300 min-w-[60px] justify-center"
              title={
                language === "en" ? "Switch to Nepali" : "Switch to English"
              }
            >
              {language === "en" ? (
                <div className="flex items-center space-x-1">
                  <span className="text-sm">🇳🇵</span>
                  <span className="text-xs font-medium">नेप</span>
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
              className="hover:bg-muted/50 transition-colors duration-300 min-w-[40px] justify-center"
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
              className="lg:hidden hover:bg-muted/50 transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-300">
            {/* Mobile Search with Suggestions */}
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
                  onClick={() => onCategoryFilter("all")}
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
                    onClick={() => onCategoryFilter(topicKey)}
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
