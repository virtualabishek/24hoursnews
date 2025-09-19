import axios from "axios";
import { JSDOM } from "jsdom";

async function scrapeLimitedNews() {
  try {
    // Fetch the webpage content
    const response = await axios.get(
      "https://narayanionline.com/category/चितवन-विशेष/",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    const dom = new JSDOM(response.data);
    const doc = dom.window.document;

    // Select all news items
    const newsItems = doc.querySelectorAll(".no-list-grid-view-item");
    const newsData = [];

    // Loop through the first 10 items
    for (let i = 0; i < Math.min(10, newsItems.length); i++) {
      const item = newsItems[i];
      const imageElement = item.querySelector(".no-news-img-link img");
      const titleElement = item.querySelector(".no-list-grid-view-info h4 a");

      const newsItem = {
        title: titleElement ? titleElement.textContent.trim() : "No title",
        link: titleElement ? titleElement.getAttribute("href") : "No link",
        image: imageElement ? imageElement.getAttribute("src") : "No image",
      };

      newsData.push(newsItem);
    }

    console.log(JSON.stringify(newsData, null, 2));
    return newsData;
  } catch (error) {
    console.error("Error scraping news:", error.message);
    return [];
  }
}

// Run the scraper
scrapeLimitedNews();
