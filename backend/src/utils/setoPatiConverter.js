// src/utils/setopatiDateConverter.js
import NepaliDateConverter from "nepali-date-converter";
const NepaliDate = NepaliDateConverter.default || NepaliDateConverter;

const nepaliMonthMap = {
  वैशाख: 1,
  जेठ: 2,
  असार: 3,
  साउन: 4,
  भदौ: 5,
  असोज: 6,
  कार्तिक: 7,
  मंसिर: 8,
  पुस: 9,
  माघ: 10,
  फागुन: 11,
  चैत: 12,
};

function normalizeNepaliDigits(str) {
  if (!str) return "";
  return str.replace(/[\u0966-\u096F]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0x0966 + 0x30)
  );
}

export function parseSetopatiDate(dateString) {
  try {
    if (!dateString || typeof dateString !== "string") {
      console.warn("Invalid dateString received:", dateString);
      return null;
    }

    let cleaned = dateString.trim();

    // Strip prefix if present (e.g., "प्रकाशित मिति: ")
    cleaned = cleaned.replace(/^प्रकाशित मिति:\s*/, "");

    // Handle time if present (e.g., "आइतबार, असोज ५, २०८२  १५:४६")
    let timePart = "12:00"; // Default midday
    const timeMatch = cleaned.match(/(\d{1,2}:\d{2})$/);
    if (timeMatch) {
      timePart = timeMatch[1];
      cleaned = cleaned.replace(/\s+\d{1,2}:\d{2}$/, "").trim();
    }

    // Format: "आइतबार, असोज ५, २०८२"
    const regex =
      /^([^\p{Nd},]+),\s*([^\p{Nd}\s]+)\s+(\p{Nd}{1,2}),\s*(\p{Nd}{4})$/u;
    const match = cleaned.match(regex);

    if (!match) {
      console.warn(`Invalid Setopati date format: ${dateString}`);
      return null;
    }

    const [, , monthName, dayStr, yearStr] = match;

    const normalizedDay = normalizeNepaliDigits(dayStr);
    const normalizedYear = normalizeNepaliDigits(yearStr);

    const bsDay = parseInt(normalizedDay, 10);
    const bsYear = parseInt(normalizedYear, 10);
    const bsMonth = nepaliMonthMap[monthName];

    if (isNaN(bsDay) || isNaN(bsYear) || !bsMonth) {
      console.warn(
        `Could not parse Setopati date components: ${monthName}, ${bsDay}, ${bsYear}`
      );
      return null;
    }

    const nepaliDate = new NepaliDate(bsYear, bsMonth, bsDay);
    const adDate = nepaliDate.toJsDate();

    // Parse and set time
    const [hoursStr, minutesStr] = timePart.split(":");
    const hours = parseInt(hoursStr, 10) || 12;
    const minutes = parseInt(minutesStr, 10) || 0;
    adDate.setHours(hours, minutes, 0, 0);

    if (isNaN(adDate.getTime())) {
      console.warn(`Invalid Gregorian date from Setopati: ${dateString}`);
      return null;
    }

    return adDate;
  } catch (err) {
    console.error(`Fatal error parsing Setopati date: ${dateString}`, err);
    return null;
  }
}
