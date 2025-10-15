"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import type { ApiArticle } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  article: ApiArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const { language, t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    if (language === "np") {
      return `${article.dateNepali} • ${article.time}`;
    }
    const date = new Date(dateStr);
    return `${date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })} • ${article.time}`;
  };

  return (
    // STEP 1: Make the entire card a vertical flex container
    <Card className="group flex flex-shrink-0 flex-col overflow-hidden border-border bg-card transition-all duration-500 hover:-translate-y-2 hover:border-primary/20 hover:shadow-xl min-w-[280px] max-w-[380px] sm:min-w-[320px]">
      <div className="relative aspect-video overflow-hidden">
        {imageError ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center text-muted-foreground">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                <ExternalLink className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm">Image not available</p>
            </div>
          </div>
        ) : (
          <Image
            src={article.image_url || "/placeholder.svg"}
            alt={language === "en" ? article.engHeading : article.nepaliHeading}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 25vw"
            className="rounded-t-md object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* STEP 2: Make the content area a flex container that grows to fill available space */}
      <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
        {/* This container holds the title and description and will take up flexible space */}
        <div className="flex-1">
          <h3
            className={cn(
              "line-clamp-2 font-semibold text-card-foreground transition-colors duration-300 group-hover:text-primary",
              language === "np"
                ? "font-nepali text-xl leading-relaxed"
                : "text-base leading-tight sm:text-lg"
            )}
          >
            {language === "en" ? article.engHeading : article.nepaliHeading}
          </h3>
          <p
            className={cn(
              "mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground",
              language === "np" && "font-nepali"
            )}
          >
            {language === "en"
              ? article.engDescription
              : article.nepaliDescription}
          </p>
        </div>

        {/* STEP 3: This "footer" container is pushed to the bottom with `mt-auto` */}
        <div className="mt-auto pt-4">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span className="max-w-[120px] truncate">
                  {article.publisher}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(article.dateEnglish)}</span>
              </div>
            </div>
          </div>

          {/* Read More Button */}
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("common.readMore")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
