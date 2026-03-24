# Getting Started with 24HoursNews

This guide will help you set up and run 24HoursNews locally on your machine.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | [Install Node.js](https://nodejs.org/) |
| pnpm | Latest | `npm install -g pnpm` |
| MySQL | 8.0+ | Or use a cloud provider |
| Git | Any recent version | For cloning |

### Optional but Recommended

- [Docker](https://docker.com) - For easy database setup
- [VS Code](https://code.visualstudio.com/) - With TypeScript extensions

## 🚀 Step-by-Step Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/24hoursnews.git
cd 24hoursnews
```

### Step 2: Database Setup

You have two options for setting up the database:

#### Option A: Using Docker (Recommended)

```bash
# Start a MySQL container
docker run -d \
  --name 24hoursnews-db \
  -e MYSQL_ROOT_PASSWORD=secretpassword \
  -e MYSQL_DATABASE=24hoursnews \
  -p 3306:3306 \
  mysql:8.0
```

#### Option B: Using Existing MySQL

If you already have MySQL installed, create a database:

```sql
CREATE DATABASE 24hoursnews;
CREATE USER 'newsuser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON 24hoursnews.* TO 'newsuser'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
```

Edit the `.env` file with your database credentials:

```env
DATABASE_URL="mysql://newsuser:yourpassword@localhost:3306/24hoursnews"
SHADOW_DATABASE_URL="mysql://newsuser:yourpassword@localhost:3306/24hoursnews"
NODE_ENV="development"
PORT=3001
```

### Step 4: Initialize Database

```bash
# Push schema to database
pnpm prisma db push

# Seed initial data
pnpm prisma db seed
```

### Step 5: Frontend Setup

```bash
cd ../frontend

# Install dependencies
pnpm install
```

## 🏃 Running the Application

### Start Backend

```bash
cd backend

# Development mode (with hot reload)
pnpm dev
```

The backend will be available at `http://localhost:3001`

### Start Frontend

In a new terminal:

```bash
cd frontend

# Development mode
pnpm dev
```

The frontend will be available at `http://localhost:3000`

### Run the Scraper Manually

```bash
cd backend

# Scrape all sources
pnpm run-scrap

# Or in development, trigger via API
curl -X POST http://localhost:3001/api/scraper/scrape
```

## 📁 Project Files Overview

Here's what you'll find in each directory:

```
24hoursnews/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema definition
│   │   └── seed.ts            # Seed data for testing
│   ├── src/
│   │   ├── controller/       # HTTP request handlers
│   │   │   ├── news.controller.ts
│   │   │   └── scrapper.controller.ts
│   │   ├── routes/            # API route definitions
│   │   │   ├── news.route.ts
│   │   │   └── scrapper.route.ts
│   │   ├── services/          # Business logic
│   │   │   ├── news.services.ts
│   │   │   ├── scrapper.service.ts
│   │   │   └── cleanup.service.ts
│   │   ├── scrappers/         # Scraper configurations
│   │   ├── scripts/           # Individual scraper implementations
│   │   │   ├── bbc-nepali.ts
│   │   │   ├── online-khabar.ts
│   │   │   ├── setopati.ts
│   │   │   └── ratopati.ts
│   │   ├── utils/             # Helper functions
│   │   └── server.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                   # Next.js app directory
│   │   ├── page.tsx           # Homepage
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   ├── data/                  # Static data files
│   ├── package.json
│   └── tailwind.config.ts
└── docs/                      # Documentation
```

## 🧪 Testing the Setup

### Check if Backend is Running

```bash
curl http://localhost:3001/api/news
```

You should see an empty array `[]` if no news has been scraped yet.

### Trigger a Scrape

```bash
curl -X POST http://localhost:3001/api/scraper/scrape
```

Wait a few seconds, then check again:

```bash
curl http://localhost:3001/api/news
```

You should now see news articles in the response.

### Check Specific Categories

```bash
# Get technology news
curl "http://localhost:3001/api/news?category=TECHNOLOGY"

# Get news from BBC
curl "http://localhost:3001/api/news?publisher=BBC"

# Search for something
curl "http://localhost:3001/api/news?search=election"
```

## 🛠️ Common Development Tasks

### Adding a New News Source

1. Create a new scraper in `backend/src/scripts/newsource.ts`
2. Add date parser in `backend/src/utils/`
3. Register in `backend/src/scrappers/scrappers.config.ts`
4. Add targets in `backend/src/lib/global-targets.ts`
5. Test the scraper

### Modifying the Database Schema

```bash
cd backend

# Make changes to schema.prisma

# Create migration
pnpm prisma migrate dev --name describe_your_change

# Or apply without migration
pnpm prisma db push
```

### Viewing Database

```bash
cd backend
pnpm prisma studio
```

This opens Prisma Studio at `http://localhost:5555` where you can view and edit data.

## 🐛 Troubleshooting

### Database Connection Issues

```
Error: P1001: Can't reach database server
```

Make sure:
- MySQL is running
- Credentials in `.env` are correct
- Database exists
- Port 3306 is not blocked

### Puppeteer Issues

```
Error: Failed to launch browser
```

Solution:
```bash
cd backend
npx puppeteer browsers install chrome
```

### Port Already in Use

```
Error: EADDRINUSE: address already in use :::3001
```

Find and kill the process:
```bash
# Find process using port 3001
lsof -i :3001

# Kill it (replace PID with actual process ID)
kill -9 PID
```

## 📚 Next Steps

Now that you have the project running, you might want to:

- [Read the Architecture Guide](architecture.md) to understand how it works
- [Learn about the API](api-reference.md) for integration
- [Check Deployment Guide](deployment.md) for production setup
- [Read Contributing Guide](../CONTRIBUTING.md) if you want to contribute

## 💬 Need Help?

- Open an issue on GitHub
- Check existing issues and discussions
- Read the source code - it's well-commented!

Happy coding! 🚀
