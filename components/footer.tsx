"use client"

import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("footer.madeBy")}</span>
            <a
              href="https://www.astavisioninfosys.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("footer.company")}
            </a>
          </div>
          <div className="text-sm text-muted-foreground">© 2025 Nepal News Hub. {t("footer.allRightsReserved")}</div>
        </div>
      </div>
    </footer>
  )
}
