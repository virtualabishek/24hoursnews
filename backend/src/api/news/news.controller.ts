import axios from "axios";
import * as cheerio from "cheerio";

interface ScrappedNews {
  heading: string;
  url: string;
  imageUrl: string;
  publisher: string;
}
