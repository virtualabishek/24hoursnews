// utils/bbcDateConverter.js (updated parseBBCDate)
import NepaliDateConverter from "nepali-date-converter";

const englishMonthMap = {
  जनवरी: 0,
  फेब्रुअरी: 1,
  मार्च: 2,
  अप्रिल: 3,
  मे: 4,
  जुन: 5,
  जुलाई: 6,
  अगस्ट: 7,
  सेप्टेम्बर: 8,
  अक्टोबर: 9,
  नोभेम्बर: 10,
  डिसेम्बर: 11,
};

function normalizeNepaliDigits(str) {
  if (!str) return "";
  return str.replace(/[\u0966-\u096F]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0x0966 + 0x30)
  );
}

export function parseBBCDate(dateString) {
  try {
    if (!dateString || typeof dateString !== "string") {
      console.warn("Invalid dateString received:", dateString);
      return null;
    }

    let cleaned = dateString.trim();

    // Normalize Nepali digits
    cleaned = normalizeNepaliDigits(cleaned);

    // Log for debug
    console.log(`BBC cleaned date: "${cleaned}"`);

    // Check if relative (e.g., "३ घण्टा पहिले", "२ दिन पहिले", "१० मिनेट पहिले")
    if (cleaned.includes("पहिले")) {
      const now = new Date(); // Use current time
      let subtractMs = 0;

      if (cleaned.includes("घण्टा")) {
        const hours = parseInt(cleaned.match(/(\d+) घण्टा/)?.[1] || "0", 10);
        subtractMs = hours * 60 * 60 * 1000;
      } else if (cleaned.includes("मिनेट")) {
        const minutes = parseInt(cleaned.match(/(\d+) मिनेट/)?.[1] || "0", 10);
        subtractMs = minutes * 60 * 1000;
      } else if (cleaned.includes("दिन")) {
        const days = parseInt(cleaned.match(/(\d+) दिन/)?.[1] || "0", 10);
        subtractMs = days * 24 * 60 * 60 * 1000;
      } // Add more if needed (साता, महिना, etc.)

      const publishedAt = new Date(now.getTime() - subtractMs);
      console.log(
        `BBC relative date "${dateString}" parsed to: ${publishedAt.toISOString()}`
      );
      return publishedAt;
    }

    // Absolute like "२१ सेप्टेम्बर २०२५" (after normalization: "21 September 2025")
    const absoluteRegex = /^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/;
    const match = cleaned.match(absoluteRegex);
    if (match) {
      const [, dayStr, monthName, yearStr] = match;
      const day = parseInt(dayStr, 10);
      const year = parseInt(yearStr, 10);
      const month = englishMonthMap[monthName];
      if (isNaN(day) || isNaN(year) || month === undefined) {
        console.warn(`Invalid absolute date: ${dateString}`);
        return null;
      }
      const publishedAt = new Date(year, month, day, 12, 0, 0); // Assume midday
      console.log(
        `BBC absolute date "${dateString}" parsed to: ${publishedAt.toISOString()}`
      );
      return publishedAt;
    }

    console.warn(`Unrecognized BBC date format: ${dateString}`);
    return null;
  } catch (err) {
    console.error(`Fatal error parsing BBC date: ${dateString}`, err);
    return null;
  }
}
