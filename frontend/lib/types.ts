export enum Category {
  BUSINESS = "BUSINESS",
  ENTERTAINMENT = "ENTERTAINMENT",
  SPORTS = "SPORTS",
  HEALTH = "HEALTH",
  EDUCATION = "EDUCATION",
  TECHNOLOGY = "TECHNOLOGY",
  INTERNATIONAL = "INTERNATIONAL",
  MERO_SHARE = "MERO_SHARE",
  GENERAL = "GENERAL",
  TRENDING = "TRENDING",
  LIFESTYLE = "LIFESTYLE",
  NATIONAL = "NATIONAL",
  OPINION = "OPINION",
  POLITICS = "Politics",
}

export interface ApiArticle {
  id: string;
  engHeading: string;
  nepaliHeading: string;
  dateEnglish: string | null;
  dateNepali: string | null;
  timeEnglish: string | null;
  timeNepali: string | null;
  url: string;
  image_url: string | null;
  publisher: string;
  engDescription: string;
  nepaliDescription: string;
  category: Category | null;
}

export interface GroupedArticles {
  [categoryKey: string]: ApiArticle[];
}
