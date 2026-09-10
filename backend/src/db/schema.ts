import { sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  foreignKey,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

export const categoryValues = [
  "BUSINESS",
  "ENTERTAINMENT",
  "SPORTS",
  "HEALTH",
  "EDUCATION",
  "TECHNOLOGY",
  "INTERNATIONAL",
  "MERO_SHARE",
  "GENERAL",
  "TRENDING",
  "LIFESTYLE",
  "NATIONAL",
  "OPINION",
  "POLITICS",
] as const;

export type Category = (typeof categoryValues)[number];

// Prisma-compatible runtime object: Category.BUSINESS === "BUSINESS", etc.
export const Category: Record<Category, Category> = {
  BUSINESS: "BUSINESS",
  ENTERTAINMENT: "ENTERTAINMENT",
  SPORTS: "SPORTS",
  HEALTH: "HEALTH",
  EDUCATION: "EDUCATION",
  TECHNOLOGY: "TECHNOLOGY",
  INTERNATIONAL: "INTERNATIONAL",
  MERO_SHARE: "MERO_SHARE",
  GENERAL: "GENERAL",
  TRENDING: "TRENDING",
  LIFESTYLE: "LIFESTYLE",
  NATIONAL: "NATIONAL",
  OPINION: "OPINION",
  POLITICS: "POLITICS",
};

export function parseCategory(value: string | undefined): Category | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  return (categoryValues as readonly string[]).includes(upper)
    ? (upper as Category)
    : undefined;
}

export const publishers = mysqlTable(
  "Publisher",
  {
    id: varchar("id", { length: 30 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: varchar("name", { length: 191 }).notNull(),
    logoUrl: text("logoUrl"),
  },
  (table) => [
    // Name matches the legacy Prisma-created constraint so `db push`
    // against the existing database is a no-op for it.
    unique("Publisher_name_key").on(table.name),
  ],
);

export const news = mysqlTable(
  "News",
  {
    id: int("id").autoincrement().primaryKey(),
    nepaliDescription: text("nepaliDescription"),
    imageUrl: text("imageUrl"),
    url: varchar("url", { length: 512 }).notNull(),
    englishTitle: text("englishTitle"),
    nepaliTitle: text("nepaliTitle"),
    englishDescription: text("englishDescription"),
    dateEnglish: varchar("dateEnglish", { length: 64 }),
    dateNepali: varchar("dateNepali", { length: 64 }),
    time: varchar("time", { length: 64 }),
    category: mysqlEnum("category", categoryValues).notNull(),
    publisherId: varchar("publisherId", { length: 30 }).notNull(),
    isTrending: boolean("isTrending").notNull().default(false),
    publishedAt: datetime("publishedAt", { mode: "date", fsp: 3 }),
    scrapedAt: datetime("scrapedAt", { mode: "date", fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (table) => [
    // Constraint/index names match the legacy Prisma-created ones so
    // `db push` against the existing database only widens columns.
    unique("News_url_key").on(table.url),
    foreignKey({
      name: "News_publisherId_fkey",
      columns: [table.publisherId],
      foreignColumns: [publishers.id],
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    index("News_category_idx").on(table.category),
    index("News_publishedAt_idx").on(table.publishedAt),
    index("News_publisher_category_idx").on(table.publisherId, table.category),
  ],
);

export const publishersRelations = relations(publishers, ({ many }) => ({
  news: many(news),
}));

export const newsRelations = relations(news, ({ one }) => ({
  publisher: one(publishers, {
    fields: [news.publisherId],
    references: [publishers.id],
  }),
}));

export type Publisher = typeof publishers.$inferSelect;
export type NewPublisher = typeof publishers.$inferInsert;
export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
export type NewsWithPublisher = News & { publisher: Publisher };
