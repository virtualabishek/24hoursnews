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

    const cleaned = dateString.trim();

    // Check if relative (e.g., "३ घण्टा पहिले", "२ दिन पहिले", "१० मिनेट पहिले")
    if (cleaned.includes("पहिले")) {
      const now = new Date(); // Use current time; in production, it's real-time
      let subtractMs = 0;

      if (cleaned.includes("घण्टा")) {
        const hours = parseInt(
          normalizeNepaliDigits(cleaned.match(/(\d+) घण्टा/)?.[1] || "0"),
          10
        );
        subtractMs = hours * 60 * 60 * 1000;
      } else if (cleaned.includes("मिनेट")) {
        const minutes = parseInt(
          normalizeNepaliDigits(cleaned.match(/(\d+) मिनेट/)?.[1] || "0"),
          10
        );
        subtractMs = minutes * 60 * 1000;
      } else if (cleaned.includes("दिन")) {
        const days = parseInt(
          normalizeNepaliDigits(cleaned.match(/(\d+) दिन/)?.[1] || "0"),
          10
        );
        subtractMs = days * 24 * 60 * 60 * 1000;
      } // Add more if needed (साता, महिना, etc.)

      const publishedAt = new Date(now.getTime() - subtractMs);
      return publishedAt;
    }

    // Absolute like "१९ सेप्टेम्बर २०२५"
    const absoluteRegex = /^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/;
    const match = cleaned.match(absoluteRegex);
    if (match) {
      const [, dayStr, monthName, yearStr] = match;
      const day = parseInt(normalizeNepaliDigits(dayStr), 10);
      const year = parseInt(normalizeNepaliDigits(yearStr), 10);
      const month = englishMonthMap[monthName];
      if (isNaN(day) || isNaN(year) || month === undefined) {
        console.warn(`Invalid absolute date: ${dateString}`);
        return null;
      }
      const publishedAt = new Date(year, month, day, 12, 0, 0); // Assume midday
      return publishedAt;
    }

    console.warn(`Unrecognized date format: ${dateString}`);
    return null;
  } catch (err) {
    console.error(`Fatal error parsing BBC date: ${dateString}`, err);
    return null;
  }
}

const NepaliDate = NepaliDateConverter.default || NepaliDateConverter;

const nepaliMonthNames = [
  "वैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुस",
  "माघ",
  "फागुन",
  "चैत",
];

export function adToNepaliDateString(adDate) {
  try {
    const bsDate = new NepaliDate(adDate);
    const bsYear = bsDate.year;
    const bsMonth = bsDate.month;
    const bsDay = bsDate.day;
    const monthName = nepaliMonthNames[bsMonth - 1];
    return `${bsYear} ${monthName} ${bsDay} गते`;
  } catch (err) {
    console.error("Error converting AD to Nepali:", err);
    return adDate.toLocaleDateString("ne-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}
