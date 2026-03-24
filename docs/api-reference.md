# API Reference

This document provides detailed information about all API endpoints available in 24HoursNews.

## Base URL

```
Development: http://localhost:3001
```

## 📰 News Endpoints

### Get All News

Retrieves news articles with optional filtering.

```
GET /api/news
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | - | Filter by category (e.g., `TECHNOLOGY`, `BUSINESS`) |
| `publisher` | string | - | Filter by publisher name (e.g., `BBC`, `Online Khabar`) |
| `search` | string | - | Search in titles and descriptions |
| `limit` | number | 200 | Maximum number of results |

#### Example Requests

```bash
# Get all news
curl http://localhost:3001/api/news

# Get technology news
curl "http://localhost:3001/api/news?category=TECHNOLOGY"

# Get news from BBC
curl "http://localhost:3001/api/news?publisher=BBC"

# Search for news about elections
curl "http://localhost:3001/api/news?search=election"

# Combined filters
curl "http://localhost:3001/api/news?category=NATIONAL&limit=50"

# Search within a category
curl "http://localhost:3001/api/news?search=economy&category=BUSINESS"
```

#### Response

```json
[
  {
    "id": 123,
    "engHeading": "Economic Growth in Nepal",
    "nepaliHeading": "नेपालमा आर्थिक वृद्धि",
    "dateEnglish": "2025-09-18",
    "dateNepali": "२०८२ असोज १",
    "time": "14:30",
    "url": "https://example.com/article",
    "image_url": "https://example.com/image.jpg",
    "publisher": "Online Khabar",
    "category": "BUSINESS",
    "engDescription": "The Nepali economy shows promising signs...",
    "nepaliDescription": "नेपाली अर्थतन्त्रले आशाजनक संकेत देखाउँदै...",
    "publishedAt": "2025-09-18T14:30:00.000Z"
  }
]
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier |
| `engHeading` | string | Title in English (null if not available) |
| `nepaliHeading` | string | Title in Nepali |
| `dateEnglish` | string | Publication date in English format |
| `dateNepali` | string | Publication date in Nepali format |
| `time` | string | Publication time |
| `url` | string | Link to original article |
| `image_url` | string | Article thumbnail image URL |
| `publisher` | string | Name of the news source |
| `category` | string | News category |
| `engDescription` | string | Description in English |
| `nepaliDescription` | string | Description in Nepali |
| `publishedAt` | string | ISO 8601 timestamp |

## 🔄 Scraper Endpoints

### Trigger Full Scrape

Initiates scraping from all configured news sources.

```
POST /api/scraper/scrape
```

#### Example Request

```bash
curl -X POST http://localhost:3001/api/scraper/scrape
```

#### Response

```json
{
  "success": true,
  "message": "Scraping completed successfully",
  "results": {
    "Online Khabar": { "scraped": 25, "new": 15, "errors": 0 },
    "BBC Nepali": { "scraped": 20, "new": 12, "errors": 1 },
    "Setopati": { "scraped": 18, "new": 10, "errors": 0 },
    "Ratopati": { "scraped": 15, "new": 8, "errors": 0 }
  }
}
```

### Scrape Specific Publisher

Initiates scraping from a specific news source.

```
POST /api/scraper/scrape/:publisher
```

#### URL Parameters

| Parameter | Description |
|-----------|-------------|
| `publisher` | Publisher name (e.g., `online-khabar`, `bbc`, `setopati`, `ratopati`) |

#### Example Requests

```bash
# Scrape only BBC Nepali
curl -X POST http://localhost:3001/api/scraper/scrape/bbc

# Scrape only Online Khabar
curl -X POST http://localhost:3001/api/scraper/scrape/online-khabar
```

#### Response

```json
{
  "success": true,
  "publisher": "BBC Nepali",
  "scraped": 20,
  "new": 12,
  "errors": 1,
  "message": "BBC Nepali scraping completed"
}
```

## 📊 Categories

Available news categories:

| Category | Value | Nepali |
|----------|-------|--------|
| Business | `BUSINESS` | व्यापार |
| Entertainment | `ENTERTAINMENT` | मनोरन्जन |
| Sports | `SPORTS` | खेलकुद |
| Health | `HEALTH` | स्वास्थ्य |
| Education | `EDUCATION` | शिक्षा |
| Technology | `TECHNOLOGY` | प्रविधि |
| International | `INTERNATIONAL` | अन्तर्राष्ट्रिय |
| Mero Share | `MERO_SHARE` | मेरो शेयर |
| General | `GENERAL` | सामान्य |
| Trending | `TRENDING` | ट्रेन्डिङ |
| Lifestyle | `LIFESTYLE` | जीवनशैली |
| National | `NATIONAL` | राष्ट्रिय |
| Opinion | `OPINION` | राय |
| Politics | `POLITICS` | राजनीति |

## 📰 Publishers

Available news publishers:

| Publisher | Domain | API Value |
|-----------|--------|-----------|
| Online Khabar | onlinekhabar.com | `online-khabar` |
| BBC Nepali | bbc.com/nepali | `bbc` |
| Setopati | setopati.com | `setopati` |
| Ratopati | ratopati.com | `ratopati` |

## ⚠️ Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid category",
  "message": "Category 'INVALID' does not exist"
}
```

### 500 Internal Server Error

```json
{
  "error": "Scraping failed",
  "message": "Failed to scrape BBC: Timeout exceeded"
}
```

## 🔒 Rate Limiting

Rate limiting is recommended for production deployments. Currently not implemented but should include:

- 100 requests per minute per IP for news endpoints
- 10 requests per minute per IP for scraper endpoints

## 💡 Usage Tips

1. **Cache Results**: The API returns fresh data from the database. Consider caching responses on your end.

2. **Use Filters**: Always filter by category or publisher when possible to reduce payload size.

3. **Handle Missing Data**: Some articles may not have English titles or descriptions. Handle null values gracefully.

4. **Image URLs**: Image URLs are provided by the source websites and may become invalid over time. Consider implementing image caching.

5. **Pagination**: For large datasets, implement pagination on your end using `limit` and date-based filtering.

## 🔗 Webhook Support (Future)

Webhook functionality is planned but not yet implemented:

```typescript
// Planned webhook configuration
POST /api/webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["news.created", "scrape.completed"],
  "secret": "your-webhook-secret"
}
```
