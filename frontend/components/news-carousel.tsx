"use client";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { NewsCard } from "./news-card";
import type { NewsArticle, TopicKey } from "@/lib/assets";

interface NewsCarouselProps {
  articles: NewsArticle[];
  title: string;
  topicKey?: TopicKey;
}

export function NewsCarousel({ articles, title, topicKey }: NewsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      const resizeObserver = new ResizeObserver(checkScrollButtons);
      resizeObserver.observe(container);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        resizeObserver.disconnect();
      };
    }
  }, [articles]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 300 : 340; // Responsive scroll amount
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (!articles || articles.length === 0) {
    return null;
  }
  const showHotIcon = topicKey === "POLITICS";

  console.log(`Rendering ${articles.length} articles for ${title}`); // Place the log here

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showHotIcon && (
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full shadow-lg animate-pulse">
              <Flame className="w-4 h-4 text-white" />
            </div>
          )}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground text-balance">
            {title}
          </h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-3 sm:space-x-4 overflow-x-auto scrollbar-hide custom-scrollbar pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {/* Gradient Overlays for Visual Cues - Hidden on mobile for better UX */}
        {canScrollLeft && (
          <div className="hidden sm:block absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        )}
        {canScrollRight && (
          <div className="hidden sm:block absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        )}
      </div>
    </div>
  );
}
