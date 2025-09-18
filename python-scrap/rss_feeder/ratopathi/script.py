import feedparser
import json
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

RSS_URL = "https://english.ratopati.com/rss/"

def extract_image_url(article_url):
    try:
        # Send a GET request to the article URL
        response = requests.get(article_url)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the HTML content of the page
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find the div containing the featured image
        featured_image_div = soup.find('div', class_='featured-images featured-images position-relative')

        if featured_image_div:
            # Find the first image within the div
            img_tag = featured_image_div.find('img')
            if img_tag and img_tag.get('src'):
                # Construct the absolute URL of the image
                image_url = urljoin(article_url, img_tag['src'])
                return image_url
        return None
    except Exception as e:
        print(f"Error extracting image URL from {article_url}: {e}")
        return None
    
def fetch_and_map():
    feed = feedparser.parse(RSS_URL)
    items = []

    for entry in feed.entries:
        # Extracting what we can
        engHeading = entry.title if 'title' in entry else ""
        url = entry.link if 'link' in entry else ""
        engDescription = entry.description if 'description' in entry else ""
        
        # pubDate → time + date in English
        dateEnglish = ""
        timeEnglish = ""
        if 'published' in entry:
            try:
                dt = datetime(*entry.published_parsed[:6])
                dateEnglish = dt.strftime("%Y-%m-%d")
                timeEnglish = dt.strftime("%-I:%M %p")  # e.g. "7:05 PM"
            except Exception:
                pass

        # Fetch the image URL
        image_url = extract_image_url(url)

        # Build the JSON item
        obj = {
            "engHeading": engHeading,
            "nepaliHeading": "",
            "dateEnglish": dateEnglish,
            "dateNepali": "",
            "timeEnglish": timeEnglish,
            "timeNepali": "",
            "url": url,
            "image_url": image_url if image_url else "",
            "publisher": "Ratopati",
            "engDescription": engDescription,
            "nepaliDescription": ""
        }

        items.append(obj)

    return items

def main():
    data = fetch_and_map()
    print(json.dumps(data, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
