import type { ScrapeJob } from "../@types/scrapper.type.js";
import {
  bbcTargets,
  onlineKhabarTargets,
  setopatiTargets,
} from "../lib/global-targets.js";
import { parseBBCDate } from "../utils/bbcDateConverter.js";
import { parseOnlineKhabarDate } from "../utils/dateConverter.js";
import { parseSetopatiDate } from "../utils/setoPatiConverter.js";
import { BBCSraper } from "../scripts/bbc-nepali.js";
import { OnlineKhabarScraper } from "../scripts/online-khabar.js";
import { SetopatiScraper } from "../scripts/setopati.js";

const onlineKhabarScraper = new OnlineKhabarScraper();
const bbcScraper = new BBCSraper();
const setopatiScraper = new SetopatiScraper();

export const SCRAPPER_JOBS: ScrapeJob[] = [
  {
    publisherName: "Online Khabar",
    scraper: onlineKhabarScraper,
    dateParser: parseOnlineKhabarDate,
    targets: onlineKhabarTargets,
  },
  {
    publisherName: "BBC Nepali",
    scraper: bbcScraper,
    dateParser: parseBBCDate,
    targets: bbcTargets,
  },
  {
    publisherName: "Setopati",
    scraper: setopatiScraper,
    dateParser: parseSetopatiDate,
    targets: setopatiTargets,
  },
];
