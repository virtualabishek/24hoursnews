import localizationData from "@/data/localization.json";
import { ApiArticle } from "./types";

export type Language = "en" | "np";

export type TopicKey = string;

interface Localization {
  navigation: {
    search: string;
    allCategories: string;
    language: string;
    theme: string;
  };
  categories: {
    [key: string]: string;
  };
  common: {
    readMore: string;
    noResults: string;
    loading: string;
    publishedOn: string;
  };
  footer: {
    madeBy: string;
    company: string;
    allRightsReserved: string;
  };
}

const categoryNames: Record<TopicKey, { en: string; np: string }> = {
  POLITICS: { en: "Politics", np: "राजनीति" },
  BUSINESS: { en: "Business", np: "व्यापार" },
  ENTERTAINMENT: { en: "Entertainment", np: "मनोरञ्जन" },
  SPORTS: { en: "Sports", np: "खेलकुद" },
  HEALTH: { en: "Health", np: "स्वास्थ्य" },
  EDUCATION: { en: "Education", np: "शिक्षा" },
  TECHNOLOGY: { en: "Technology", np: "प्रविधि" },
  INTERNATIONAL: { en: "International", np: "अन्तर्राष्ट्रिय" },
  MERO_SHARE: { en: "Share Market", np: "शेयर बजार" },
  GENERAL: { en: "General", np: "सामान्य" },
  TRENDING: { en: "Trending", np: "ट्रेन्डिङ" },
  LIFESTYLE: { en: "Lifestyle", np: "जीवनशैली" },
  NATIONAL: { en: "National", np: "राष्ट्रिय" },
  OPINION: { en: "Opinion", np: "विचार" },
};

export function getLocalization(language: Language = "en"): Localization {
  const fallbackLocalization: Localization = {
    navigation: {
      search: language === "en" ? "Search..." : "खोज्नुहोस्...",
      allCategories: language === "en" ? "All Categories" : "सबै श्रेणीहरू",
      language: language === "en" ? "Language" : "भाषा",
      theme: language === "en" ? "Theme" : "थिम",
    },
    categories: Object.keys(categoryNames).reduce((acc, key) => {
      acc[key] = categoryNames[key as TopicKey][language];
      return acc;
    }, {} as Record<string, string>),
    common: {
      readMore: language === "en" ? "Read More" : "थप पढ्नुहोस्",
      noResults:
        language === "en" ? "No results found" : "कुनै नतिजा फेला परेन",
      loading: language === "en" ? "Loading..." : "लोड गर्दै...",
      publishedOn: language === "en" ? "Published on" : "प्रकाशित मिति",
    },
    footer: {
      madeBy: language === "en" ? "Made by" : "निर्माता",
      company: "AstaVision Infosys",
      allRightsReserved:
        language === "en" ? "All rights reserved." : "सबै अधिकार सुरक्षित।",
    },
  };

  if (!localizationData || !localizationData[language]) {
    return fallbackLocalization;
  }

  // Merge with fallback to ensure all keys exist
  const loadedData = localizationData[language] as Localization;
  return {
    ...fallbackLocalization,
    ...loadedData,
    categories: {
      ...fallbackLocalization.categories,
      ...(loadedData.categories || {}),
    },
  };
}

export function getTopicName(topic: string, language: Language): string {
  const upperTopic = topic.toUpperCase() as TopicKey;
  if (categoryNames[upperTopic]) {
    return categoryNames[upperTopic][language];
  }

  return topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
}

export type NewsArticle = ApiArticle;
