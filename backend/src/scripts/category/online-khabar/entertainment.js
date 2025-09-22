import axios from "axios";
import { JSDOM } from "jsdom";

async function scrapeBusinessNews() {
  try {
    const response = await axios.get(
      "https://www.onlinekhabar.com/content/entertainment",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    const dom = new JSDOM(response.data);
    const doc = dom.window.document;

    const newsItems = doc.querySelectorAll(
      ".ok-col-left .ok-grid-12 .ok-news-post"
    );
    const newsData = [];

    for (let i = 0; i < Math.min(6, newsItems.length); i++) {
      const item = newsItems[i];

      const imageElement = item.querySelector(
        ".post-img-wrap img, .ok-post-thumb"
      );
      const titleElement = item.querySelector(
        ".post-title-wrap h4 a, .ok-post-content-wrap h2"
      );
      const linkElement = item.querySelector("a");

      let description = "No description";
      let date = "No date";

      if (linkElement) {
        try {
          const articleResponse = await axios.get(linkElement.href, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          });
          const articleDOM = new JSDOM(articleResponse.data);
          const articleDoc = articleDOM.window.document;

          const descElement = articleDoc.querySelector(".sgexcerpt p");
          const dateElement = articleDoc.querySelector(
            ".ok-news-post-hour span"
          );

          if (descElement) description = descElement.textContent.trim();
          if (dateElement) date = dateElement.textContent.trim();
        } catch (err) {
          console.warn("Could not fetch article details:", err.message);
        }
      }

      const newsItem = {
        title: titleElement ? titleElement.textContent.trim() : "No title",
        link: linkElement ? linkElement.getAttribute("href") : "No link",
        image: imageElement ? imageElement.getAttribute("src") : "No image",
        description,
        date,
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

scrapeBusinessNews();
