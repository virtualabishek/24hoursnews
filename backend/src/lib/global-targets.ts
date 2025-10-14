import { Category } from "../generated/prisma/client.js";

export const onlineKhabarTargets = [
  {
    category: Category.ENTERTAINMENT,
    url: "https://www.onlinekhabar.com/content/entertainment",
  },
  {
    category: Category.BUSINESS,
    url: "https://www.onlinekhabar.com/content/business",
  },
  {
    category: Category.TECHNOLOGY,
    url: "https://www.onlinekhabar.com/content/technology",
  },
  {
    category: Category.LIFESTYLE,
    url: "https://www.onlinekhabar.com/content/lifestyle",
  },
  {
    category: Category.NATIONAL,
    url: "https://www.onlinekhabar.com/content/news/rastiya",
  },
  {
    category: Category.OPINION,
    url: "https://www.onlinekhabar.com/content/opinion",
  },
  {
    category: Category.INTERNATIONAL,
    url: "https://www.onlinekhabar.com/content/international",
  },
];

export const bbcTargets = [
  {
    category: Category.INTERNATIONAL,
    url: "https://www.bbc.com/nepali/topics/cy5nkr41gx6t",
  },
  {
    category: Category.NATIONAL,
    url: "https://www.bbc.com/nepali/topics/cyx5k2yzyj6t",
  },
  {
    category: Category.HEALTH,
    url: "https://www.bbc.com/nepali/topics/c2dwqjg83q0t",
  },
  {
    category: Category.TECHNOLOGY,
    url: "https://www.bbc.com/nepali/topics/c9de5jl3967t",
  },
];

export const setopatiTargets = [
  { category: Category.POLITICS, url: "https://www.setopati.com/politics" },
  { category: Category.BUSINESS, url: "https://www.setopati.com/kinmel" },
  { category: Category.OPINION, url: "https://www.setopati.com/opinion" },
  { category: Category.SPORTS, url: "https://www.setopati.com/sports" },
  { category: Category.INTERNATIONAL, url: "https://www.setopati.com/global" },
];

export const ratopatiTargets = [
  {
    category: Category.HEALTH,
    url: "https://www.ratopati.com/category/health",
  },
  {
    category: Category.ENTERTAINMENT,
    url: "https://www.ratopati.com/category/entertainment",
  },
  {
    category: Category.SPORTS,
    url: "https://www.ratopati.com/category/sports",
  },
  {
    category: Category.INTERNATIONAL,
    url: "https://www.ratopati.com/category/international",
  },
];
