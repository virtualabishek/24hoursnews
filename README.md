# 24HoursNews

<p align="center">
  <!-- Add your logo to .github/assets/logo.png -->
  <!-- Demo images can be added to .github/assets/ -->
  <!-- See .github/assets/README.md for details -->
</p>

<p align="center">
  A real-time Nepali news aggregator that collects and curates news from multiple trusted Nepali news sources into one unified platform.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#supported-sources">News Sources</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## ✨ Features

- **Multi-Source Aggregation**: Collects news from multiple trusted Nepali news outlets
- **Category Organization**: News organized into categories like Business, Technology, Sports, Entertainment, and more
- **Bilingual Support**: Full support for both Nepali (नेपाली) and English content
- **Auto-Refresh**: Automatically fetches fresh news every 3 hours
- **Smart Search**: Full-text search across all news articles
- **Trending News**: Dedicated section for trending stories
- **RESTful API**: Clean API endpoints for integration with other applications

## 📰 Supported News Sources

| Publisher | Website | Categories |
|-----------|---------|------------|
| Online Khabar | [onlinekhabar.com](https://www.onlinekhabar.com) | Business, Technology, National, International, Entertainment, Lifestyle, Opinion |
| BBC Nepali | [bbc.com/nepali](https://www.bbc.com/nepali) | National, International, Various |
| Setopati | [setopati.com](https://www.setopati.com) | Politics, National, Various |
| Ratopati | [ratopati.com](https://ratopati.com) | News, Politics, Various |

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL
- **Web Scraping**: Puppeteer + Cheerio
- **Scheduler**: node-cron

### Frontend
- **Framework**: Next.js 14
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Hooks
- **Analytics**: Vercel Analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MySQL 8.0+ or MySQL compatible database (e.g., PlanetScale, MySQL on Clever Cloud)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/24hoursnews.git
cd 24hoursnews
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Setup database
pnpm prisma migrate deploy
pnpm prisma db seed

# Start development server
pnpm dev
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### 4. Run the Scraper

```bash
cd backend
pnpm run-scrap
```

The backend will be available at `http://localhost:3001` and frontend at `http://localhost:3000`.

## 📁 Project Structure

```
24hoursnews/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── src/
│   │   ├── controller/        # API controllers
│   │   ├── routes/            # Express routes
│   │   ├── services/          # Business logic
│   │   ├── scrappers/         # Web scraper implementations
│   │   ├── scripts/           # Individual scraper scripts
│   │   ├── utils/             # Utility functions
│   │   ├── lib/               # Shared libraries
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   └── package.json
├── frontend/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── data/                   # Static data and localization
│   └── package.json
├── docs/                       # Documentation
├── .github/                    # GitHub templates
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="mysql://user:password@host:3306/24hoursnews"
SHADOW_DATABASE_URL="mysql://user:password@host:3306/24hoursnews_shadow"

# App
NODE_ENV="development"
PORT=3001
```

## 📡 API Reference

### News Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/news` | GET | Fetch all news (supports filtering) |
| `GET /api/news?category=TECHNOLOGY` | GET | Filter by category |
| `GET /api/news?search=keyword` | GET | Search news |
| `GET /api/news?publisher=BBC` | GET | Filter by publisher |

### Scraper Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/scraper/scrape` | POST | Trigger manual scrape for all sources |
| `POST /api/scraper/scrape/:publisher` | POST | Scrape specific publisher |

### Response Format

```json
{
  "id": 123,
  "engHeading": "News title in English",
  "nepaliHeading": "नेपालीमा शीर्षक",
  "dateEnglish": "2025-09-18",
  "dateNepali": "२०८२ असोज १",
  "time": "14:30",
  "url": "https://source.com/article",
  "image_url": "https://source.com/image.jpg",
  "publisher": "Online Khabar",
  "category": "TECHNOLOGY",
  "engDescription": "Description in English...",
  "nepaliDescription": "नेपालीमा विवरण...",
  "publishedAt": "2025-09-18T14:30:00.000Z"
}
```

## 🗄 Database Schema

The application uses Prisma ORM with MySQL. Main models:

- **News**: Core news articles with metadata
- **Publisher**: News source information

## 🔄 How It Works

1. **Scraping**: The scraper uses Puppeteer to render JavaScript-heavy pages and Cheerio to parse HTML content
2. **Date Parsing**: Custom date parsers handle Nepali date formats and convert them to standard formats
3. **Storage**: Scraped news is stored in MySQL database with unique URL constraint to prevent duplicates
4. **Serving**: The API serves cached news from the database, avoiding repeated scraping
5. **Scheduling**: Cron jobs run every 3 hours to keep content fresh

## 🔒 Security Notes

- The scraper respects robots.txt of source websites
- Rate limiting is recommended for production deployments
- CORS is configured for specific allowed origins

## 🌐 Deployment

### Backend Deployment

The backend can be deployed to any Node.js hosting platform:

1. Set up environment variables
2. Run database migrations: `pnpm prisma migrate deploy`
3. Build: `pnpm build`
4. Start: `pnpm start`

### Frontend Deployment

The frontend (Next.js) can be deployed to Vercel:

```bash
cd frontend
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All the Nepali news publishers for their quality journalism
- The open-source community for amazing tools and libraries

---

<p align="center">
  Made with ❤️ for the Nepali community
</p>
