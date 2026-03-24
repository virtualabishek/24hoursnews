# Contributing to 24HoursNews

Thank you for your interest in contributing to 24HoursNews! We welcome contributions from everyone. This guide will help you get started.

## 🌍 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. We do not tolerate harassment or discrimination of any kind.

## 🤔 How Can I Contribute?

### 🐛 Reporting Bugs

Before submitting a bug report:
- Check if the issue already exists
- Use the bug report template
- Include as much detail as possible:
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots (if applicable)
  - Your environment (OS, Node version, etc.)

### 💡 Suggesting Features

We love new ideas! Please:
- Check if the feature was already suggested
- Describe the feature in detail
- Explain why it would benefit the project
- Provide use cases

### 🔧 Pull Requests

#### Process

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Or via CLI:
   git clone https://github.com/YOUR_USERNAME/24hoursnews.git
   cd 24hoursnews
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # OR for bug fixes:
   git checkout -b fix/your-bug-fix
   ```

3. **Set Up Development Environment**
   ```bash
   # Backend setup
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   pnpm install
   pnpm prisma migrate dev

   # Frontend setup
   cd ../frontend
   pnpm install
   ```

4. **Make Your Changes**
   - Write clean, maintainable code
   - Follow existing code style and conventions
   - Add comments where necessary
   - Test your changes thoroughly

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # Use conventional commit messages
   ```

   **Commit Message Format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Use the Pull Request template
   - Fill in all required information
   - Link any related issues

## 📝 Development Guidelines

### Backend (TypeScript/Node.js)

- Use TypeScript for all new code
- Follow the existing project structure
- Use existing utility functions for common tasks
- Handle errors gracefully
- Write type-safe code

### Frontend (Next.js/React)

- Use functional components with hooks
- Follow the existing component patterns
- Keep components small and focused
- Use Tailwind CSS for styling
- Ensure responsive design

### Web Scrapers

When adding a new news source:

1. **Analyze the Source**
   - Check the website structure
   - Identify article patterns
   - Note any anti-scraping measures

2. **Create the Scraper**
   ```typescript
   // In backend/src/scripts/
   export class NewSourceScraper {
     async scrape(): Promise<ScrapedArticle[]> {
       // Implementation
     }
   }
   ```

3. **Add Date Parser**
   - Handle the source's date format
   - Support both Nepali and English dates

4. **Register in Config**
   - Add to `scrappers.config.ts`
   - Add to `global-targets.ts`

5. **Test Thoroughly**
   - Run the scraper manually
   - Verify data accuracy
   - Check for edge cases

### Database Changes

When modifying the Prisma schema:

```bash
# Generate migration
cd backend
pnpm prisma migrate dev --name describe_your_change

# Update generated client
pnpm prisma generate
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pnpm test
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

## 📚 Documentation

Please update documentation when:
- Adding new features
- Changing configuration
- Modifying API endpoints
- Adding new news sources

## ❓ Questions?

Feel free to:
- Open an issue for questions
- Join discussions on existing issues
- Check the [documentation](docs/)

## 🎯 Areas Where Help is Needed

- [ ] Adding more news sources
- [ ] Improving search functionality
- [ ] Adding more language support
- [ ] Performance optimization
- [ ] Mobile app development
- [ ] Translation improvements
- [ ] Testing coverage

## 📜 Licensing

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for making 24HoursNews better! 🚀
