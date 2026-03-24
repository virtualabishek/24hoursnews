# 24HoursNews - Architecture Guide

This document provides an in-depth look at how 24HoursNews works, its architecture, and the decisions behind the design.

## 🏗️ System Overview

24HoursNews is a full-stack application that aggregates news from various Nepali news sources into a single platform. The system follows a traditional client-server architecture with scheduled data collection.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  News Sources   │────▶│     Backend      │────▶│    Database     │
│  (Online Khabar │     │   (Express +     │     │    (MySQL +     │
│   BBC, etc.)    │     │    Prisma)       │     │     Prisma)     │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │    Frontend     │
                        │   (Next.js)     │
                        │                 │
                        └─────────────────┘
```

## 🗄️ Database Design

### Schema Overview

The database consists of two main models:

#### News Model
The core entity storing aggregated news articles.

```prisma
model News {
  id                 Int        @id @default(autoincrement())
  nepaliDescription  String?    @db.Text
  imageUrl           String
  url                String     @unique
  englishTitle       String?
  nepaliTitle        String?
  englishDescription String?     @db.Text
  dateEnglish        String?
  dateNepali         String?
  time               String?
  category           Category
  publisherId        String
  publisher          Publisher  @relation(...)
  isTrending         Boolean    @default(false)
  publishedAt        DateTime?
  scrapedAt          DateTime   @default(now())
}
```

#### Publisher Model
Stores information about news sources.

```prisma
model Publisher {
  id        String @id @default(cuid())
  name      String @unique
  logoUrl   String?
  news      News[]
}
```

### Categories

The system supports the following news categories:

| Category | Nepali | Description |
|----------|--------|-------------|
| BUSINESS | व्यापार | Business and economy news |
| ENTERTAINMENT | मनोरन्जन | Entertainment and celebrities |
| SPORTS | खेलकुद | Sports coverage |
| HEALTH | स्वास्थ्य | Health and wellness |
| EDUCATION | शिक्षा | Education news |
| TECHNOLOGY | प्रविधि | Tech and innovation |
| INTERNATIONAL | अन्तर्राष्ट्रिय | World news |
| MERO_SHARE | मेरो शेयर | Stock market |
| GENERAL | सामान्य | General news |
| TRENDING | ट्रेन्डिङ | Trending stories |
| LIFESTYLE | जीवनशैली | Lifestyle content |
| NATIONAL | राष्ट्रिय | National news |
| OPINION | राय | Opinion pieces |
| POLITICS | राजनीति | Political news |

## 🔌 Backend Architecture

### Directory Structure

```
backend/src/
├── controller/      # Handles HTTP requests
├── routes/           # Express route definitions
├── services/         # Business logic
│   ├── news.services.ts      # News fetching logic
│   ├── scrapper.service.ts   # Scraping orchestration
│   └── cleanup.service.ts     # Data cleanup
├── scrappers/        # Scraper base classes
│   ├── scrappers.interface.ts
│   └── scrappers.config.ts
├── scripts/          # Individual scraper implementations
│   ├── bbc-nepali.ts
│   ├── online-khabar.ts
│   ├── setopati.ts
│   └── ratopati.ts
├── utils/            # Utility functions
│   ├── dateConverter.js       # Date parsing
│   ├── bbcDateConverter.js
│   ├── setoPatiConverter.js
│   └── ratopatiConverter.js
└── lib/              # Shared libraries
    ├── prisma.ts            # Prisma client
    └── global-targets.ts    # Scraping targets
```

### Key Components

#### 1. Scraper Service
The `ScraperService` orchestrates the scraping process:

```typescript
class ScrappingService {
  async runAllScraps(): Promise<void>
  async scrapePublisher(job: ScrapeJob): Promise<void>
  async scrapeCategory(...)
}
```

#### 2. News Service
Handles fetching and filtering news:

```typescript
async function fetchNews(filters: {
  category?: string
  publisherName?: string
  searchQuery?: string
  limit?: number
})
```

#### 3. Individual Scrapers
Each news source has its own scraper class:

- `BBCSraper` - BBC Nepali
- `OnlineKhabarScraper` - Online Khabar
- `SetopatiScraper` - Setopati
- `RatopatiScraper` - Ratopati

## 🌐 API Design

### RESTful Endpoints

#### News Endpoints

| Method | Endpoint | Query Parameters | Description |
|--------|----------|------------------|-------------|
| GET | `/api/news` | - | Get all news |
| GET | `/api/news` | `?category=TECHNOLOGY` | Filter by category |
| GET | `/api/news` | `?publisher=BBC` | Filter by publisher |
| GET | `/api/news` | `?search=keyword` | Search news |

#### Scraper Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scraper/scrape` | Trigger full scrape |
| POST | `/api/scraper/scrape/:publisher` | Scrape specific source |

### Response Format

```typescript
interface NewsResponse {
  id: number
  engHeading: string | null
  nepaliHeading: string | null
  dateEnglish: string | null
  dateNepali: string | null
  time: string | null
  url: string
  image_url: string
  publisher: string
  category: Category
  engDescription: string | null
  nepaliDescription: string | null
  publishedAt: string
}
```

## ⏰ Scheduling System

The application uses `node-cron` for scheduled tasks:

```typescript
// Run every 3 hours in production
cron.schedule("0 */3 * * *", async () => {
  await cleanupOldArticles(30)  // Delete articles older than 30 days
  await scrapingService.runAllScraps()
}, { timezone: "Asia/Kathmandu" })
```

### Cleanup Strategy

- Articles older than 30 days are automatically deleted
- Cleanup runs before scraping to maintain database size
- The `isTrending` flag is recalculated based on recency

## 🔄 Data Flow

### Scraping Flow

```
1. Scheduler triggers scrape (every 3 hours)
       ↓
2. ScraperService.runAllScraps() called
       ↓
3. For each configured publisher:
       ↓
4. Initialize scraper instance
       ↓
5. For each target URL:
       - Launch Puppeteer browser
       - Navigate to page
       - Wait for content to load
       - Extract HTML with Cheerio
       ↓
6. Parse dates using source-specific parser
       ↓
7. Transform data to standard format
       ↓
8. Check for duplicates (URL uniqueness)
       ↓
9. Save to database via Prisma
       ↓
10. Close browser, cleanup
```

### Fetching Flow

```
1. Client requests GET /api/news
       ↓
2. Controller receives request
       ↓
3. Parse query parameters
       ↓
4. Call NewsService.fetchNews()
       ↓
5. Build Prisma query with filters
       ↓
6. Execute database query
       ↓
7. Transform results to response format
       ↓
8. Return JSON response
```

## 🛠️ Technology Decisions

### Why Puppeteer + Cheerio?

- **Puppeteer**: Handles JavaScript-rendered pages and dynamic content
- **Cheerio**: Fast and lightweight HTML parsing
- **Combined**: Get the best of both - dynamic content loading with fast parsing

### Why Prisma?

- Type-safe database access
- Excellent migration system
- Easy schema management
- Good developer experience

### Why MySQL?

- Reliable and widely supported
- Good performance for read-heavy workloads
- Easy deployment options (managed services)
- JSON support for flexible data

### Why Next.js for Frontend?

- Server-side rendering for SEO
- API routes for backend functionality
- Excellent developer experience
- Built-in optimizations

## 🔐 Security Considerations

1. **CORS**: Only whitelisted origins can access the API
2. **Rate Limiting**: Recommended for production (not implemented yet)
3. **Input Validation**: All API inputs are validated
4. **Database**: Using parameterized queries (via Prisma)
5. **Environment Variables**: Sensitive data stored in env vars

## 📈 Performance Optimizations

1. **Database Indexing**: Indexes on frequently queried columns
2. **Unique Constraints**: Prevents duplicate entries
3. **Pagination**: Not implemented but recommended for large datasets
4. **Caching**: Not implemented but Redis could be added

## 🔮 Future Improvements

- [ ] Add rate limiting
- [ ] Implement Redis caching
- [ ] Add GraphQL API
- [ ] Real-time updates with WebSockets
- [ ] Admin dashboard
- [ ] User preferences
- [ ] Push notifications
- [ ] Mobile app
