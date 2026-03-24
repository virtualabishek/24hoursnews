# Adding a New News Source

This guide walks you through adding a new Nepali news source to 24HoursNews.

## 📋 Prerequisites

Before adding a new source, make sure you understand:

- Basic TypeScript
- Web scraping concepts
- The existing codebase structure

## 🗺️ Overview of Steps

1. Analyze the target website
2. Create the scraper class
3. Add date parser utility
4. Register in configuration
5. Test the scraper

## 🔍 Step 1: Analyze the Target Website

### What to Look For

1. **Website Structure**
   - How are articles listed?
   - What's the page structure?
   - Are there category pages?

2. **Article Data Points**
   - Title (English and Nepali)
   - Publication date
   - Author (if available)
   - Image URL
   - Description/Summary
   - Category

3. **Technical Details**
   - Is it a static HTML site or JavaScript-heavy?
   - Does it require login?
   - Any anti-scraping measures?

### Example Analysis: Online Khabar

```html
<!-- Example article structure -->
<article class="news-item">
  <a href="/content-path">
    <img src="image-url" alt="title" />
    <h2>Article Title</h2>
  </a>
  <span class="date">2025-09-18</span>
  <p class="description">Article summary...</p>
</article>
```

### Tools for Analysis

- **Browser DevTools**: Inspect HTML structure
- **SelectorGadget**: Find CSS selectors
- **JSONView**: If site provides JSON API

## 📝 Step 2: Create the Scraper Class

Create a new file in `backend/src/scripts/` (e.g., `newsource.ts`):

```typescript
import axios from "axios";
import * as cheerio from "cheerio";
import { News } from "../@types/scrapper.type.js";
import { BaseScraper, ScraperConfig } from "../scrappers/scrappers.interface.js";

export class NewSourceScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: "New Source",
      baseUrl: "https://www.newsource.com",
      selectors: {
        article: ".article-item",
        title: "h2.title",
        description: ".summary",
        image: "img.thumbnail",
        date: ".publish-date",
        category: ".category-tag",
      },
    };
    super(config);
  }

  async scrapeListPage(url: string): Promise<string[]> {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articleUrls: string[] = [];

    $(this.config.selectors.article).each((_, el) => {
      const href = $(el).find("a").attr("href");
      if (href) {
        articleUrls.push(href);
      }
    });

    return articleUrls;
  }

  async scrapeArticle(url: string): Promise<Partial<News>> {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $(this.config.selectors.title).text().trim();
    const description = $(this.config.selectors.description).text().trim();
    const imageUrl = $(this.config.selectors.image).attr("src") || "";
    const dateStr = $(this.config.selectors.date).text().trim();
    const category = $(this.config.selectors.category).text().trim();

    return {
      nepaliTitle: title,
      nepaliDescription: description,
      imageUrl,
      url,
      dateNepali: dateStr,
      category: this.mapCategory(category),
    };
  }

  private mapCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      "प्रविधि": "TECHNOLOGY",
      "राजनीति": "POLITICS",
      "अर्थ": "BUSINESS",
      "खेलकुद": "SPORTS",
      "मनोरन्जन": "ENTERTAINMENT",
    };

    return categoryMap[category] || "GENERAL";
  }
}
```

### Using Puppeteer (for JavaScript-rendered pages)

If the site requires JavaScript rendering:

```typescript
import puppeteer from "puppeteer";
import axios from "axios";
import * as cheerio from "cheerio";

export class JSHeavyScraper {
  private browser;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async scrapeArticle(url: string) {
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const content = await page.content();
    const $ = cheerio.load(content);

    // Extract data...
    
    await page.close();
    return extractedData;
  }

  async cleanup() {
    await this.browser.close();
  }
}
```

## 📅 Step 3: Add Date Parser

Create a utility file in `backend/src/utils/` (e.g., `newsourceConverter.js`):

```javascript
import NepaliDate from "nepali-date-converter";

/**
 * Parse date from New Source format
 * Example: "१ असोज २०८२" -> { nepali: "१ असोज २०८२", english: "2025-09-18" }
 */
export function parseNewSourceDate(dateStr) {
  if (!dateStr) return null;

  // Pattern: Nepali date format like "१ असोज २०८२"
  const nepaliPattern = /(\d+)\s+(\S+)\s+(\d+)/;
  const match = dateStr.match(nepaliPattern);

  if (!match) return null;

  const [, day, month, year] = match;

  // Convert Nepali date to English
  const monthMap = {
    "बैशाख": 1,
    "जेठ": 2,
    "असार": 3,
    "साउन": 4,
    "श्रावण": 5,
    "भदौ": 6,
    "असोज": 7,
    "कार्तिक": 8,
    "मङ्सिर": 9,
    "पुस": 10,
    "माघ": 11,
    "फाल्गुन": 12,
  };

  const monthNum = monthMap[month] || 1;
  const nepaliDate = new NepaliDate(year, monthNum - 1, day);
  const englishDate = nepaliDate.toJsDate();

  return {
    nepali: `${day} ${month} ${year}`,
    english: englishDate.toISOString().split("T")[0],
    time: englishDate.toTimeString().slice(0, 5),
  };
}
```

## ⚙️ Step 4: Register in Configuration

### Add Targets

Edit `backend/src/lib/global-targets.ts`:

```typescript
export const newSourceTargets = [
  {
    category: "TECHNOLOGY",
    url: "https://www.newsource.com/category/technology",
    selectors: { /* category-specific selectors */ },
  },
  {
    category: "BUSINESS",
    url: "https://www.newsource.com/category/business",
    selectors: { /* ... */ },
  },
  // Add more categories...
];
```

### Register Scraper

Edit `backend/src/scrappers/scrappers.config.ts`:

```typescript
import { NewSourceScraper } from "../scripts/newsource.js";
import { parseNewSourceDate } from "../utils/newsourceConverter.js";
import { newSourceTargets } from "../lib/global-targets.js";

const newSourceScraper = new NewSourceScraper();

export const SCRAPPER_JOBS: ScrapeJob[] = [
  // ... existing scrapers ...
  
  {
    publisherName: "New Source",
    scraper: newSourceScraper,
    dateParser: parseNewSourceDate,
    targets: newSourceTargets,
  },
];
```

## ✅ Step 5: Test the Scraper

### Manual Test

```bash
cd backend

# Run only the new scraper
npx tsx -e "
import { NewSourceScraper } from './src/scripts/newsource.js';
import { parseNewSourceDate } from './src/utils/newsourceConverter.js';

const scraper = new NewSourceScraper();
scraper.scrape()
  .then(articles => console.log(JSON.stringify(articles, null, 2)))
  .catch(console.error);
"
```

### API Test

Start the server and trigger scrape:

```bash
# Start server
pnpm dev

# In another terminal, trigger scrape
curl -X POST http://localhost:3001/api/scraper/scrape/new-source
```

### Check Database

```bash
pnpm prisma studio
```

Navigate to the News table and verify:
- New articles are created
- Data is correctly parsed
- Categories are assigned properly

## 📋 Checklist

Before submitting your contribution:

- [ ] Scraper handles errors gracefully
- [ ] Date parsing works for various date formats
- [ ] Handles missing/incomplete data
- [ ] Respects robots.txt
- [ ] No hardcoded credentials
- [ ] Code follows project conventions
- [ ] Tested with sample articles
- [ ] Documentation updated

## 🐛 Common Issues

### 1. Dynamic Content Not Loading

**Problem**: Puppeteer renders but content is empty.

**Solution**: 
- Wait for specific selectors
- Use `networkidle2` or `domcontentloaded`
- Check for lazy loading

### 2. Date Parsing Failures

**Problem**: Dates are undefined or wrong.

**Solution**:
- Log the raw date string
- Check for timezone issues
- Handle different date formats

### 3. Duplicate Entries

**Problem**: Same article scraped multiple times.

**Solution**:
- Check `url` is unique
- Use `upsert` in Prisma instead of `create`
- The unique constraint handles this automatically

## 📚 Resources

- [Cheerio Documentation](https://cheerio.js.org/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Prisma Documentation](https://prisma.io/docs)
- [Nepali Date Converter](https://www.npmjs.com/package/nepali-date-converter)

## ❓ Need Help?

- Check existing scrapers for reference
- Open an issue with your target website
- Ask in discussions
