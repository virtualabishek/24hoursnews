"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, User } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { NewsArticle } from "@/lib/assets"
import Image from "next/image"

interface NewsCardProps {
  article: NewsArticle
}

export function NewsCard({ article }: NewsCardProps) {
  const { language, t } = useLanguage()
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const formatDate = (dateStr: string) => {
    if (language === "np") {
      return article.dateNepali
    }
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-card border-border overflow-hidden min-w-[280px] sm:min-w-[320px] max-w-[380px] flex-shrink-0 hover:border-primary/20">
      <div className="relative aspect-video overflow-hidden">
        {!imageError ? (
          <Image
            src={article.image_url || "/placeholder.svg"}
            alt={language === "en" ? article.engHeading : article.nepaliHeading}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm">Image not available</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      <CardContent className="p-4 sm:p-5">
        <div className="space-y-3">
          {/* Heading */}
          <h3 className="font-semibold text-base sm:text-lg leading-tight text-card-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {language === "en" ? article.engHeading : article.nepaliHeading}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {language === "en" ? article.engDescription : article.nepaliDescription}
          </p>

          {/* Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{article.publisher}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(article.dateEnglish)}</span>
              </div>
            </div>
          </div>

          {/* Read More Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 bg-transparent hover:shadow-md"
            onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {t("common.readMore")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
