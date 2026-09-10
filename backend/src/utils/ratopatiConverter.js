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

export function parseRatopatiDate(dateString) {
  try {
    if (!dateString || typeof dateString !== "string") {
      console.warn("Invalid dateString received:", dateString);
      return null;
    }

    const cleanedDateString = dateString.replace(/\s+/g, " ").trim();

    // Regex for Ratopati format: "DayName, Day Month Year, HH : MM"
    const regex =
      /^([^\s,]+),\s*([\p{Nd}]+)\s+([^\s]+)\s+([\p{Nd}]+),\s*([\p{Nd}]{2})\s*:\s*([\p{Nd}]{2})$/u;
    // Alt format seen on listing pages: "Year Month Day गते HH : MM"
    // e.g. "२०८३ भदौ २५ गते ९:४०"
    const altRegex =
      /^([\p{Nd}]+)\s+([^\s]+)\s+([\p{Nd}]+)\s+गते\s+([\p{Nd}]{1,2})\s*:\s*([\p{Nd}]{2})$/u;
    const match = cleanedDateString.match(regex);
    const altMatch = match ? null : cleanedDateString.match(altRegex);

    if (!match && !altMatch) {
      console.warn(`Invalid date format (regex failed): ${dateString}`);
      return null;
    }

    let dayStr, monthName, yearStr, hoursStr, minutesStr;
    if (match) {
      [, , dayStr, monthName, yearStr, hoursStr, minutesStr] = match;
    } else {
      [, yearStr, monthName, dayStr, hoursStr, minutesStr] = altMatch;
    }

    // Normalize digits to ASCII for parseInt
    const normalizedYear = normalizeNepaliDigits(yearStr);
    const normalizedDay = normalizeNepaliDigits(dayStr);
    const normalizedHours = normalizeNepaliDigits(hoursStr);
    const normalizedMinutes = normalizeNepaliDigits(minutesStr);

    const bsYear = parseInt(normalizedYear, 10);
    const bsDay = parseInt(normalizedDay, 10);
    const bsMonth = nepaliMonthMap[monthName];

    if (isNaN(bsYear) || isNaN(bsDay) || !bsMonth) {
      console.warn(
        `Could not parse components: Y:${bsYear}, M:${bsMonth}, D:${bsDay}`
      );
      return null;
    }

    const nepaliDate = new NepaliDate(bsYear, bsMonth - 1, bsDay);
    const adDate = nepaliDate.toJsDate();

    const hours = parseInt(normalizedHours, 10) || 0;
    const minutes = parseInt(normalizedMinutes, 10) || 0;
    adDate.setHours(hours, minutes, 0, 0);

    if (isNaN(adDate.getTime())) {
      console.warn(`Invalid Gregorian date generated for: ${dateString}`);
      return null;
    }

    return adDate;
  } catch (err) {
    console.error(`Fatal error parsing date: ${dateString}`, err);
    return null;
  }
}
