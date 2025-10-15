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

export function parseOnlineKhabarDate(dateString) {
  try {
    if (!dateString || typeof dateString !== "string") {
      console.warn("Invalid dateString received:", dateString);
      return null;
    }

    const cleanedDateString = dateString.replace(/\s+/g, " ").trim();

    const regex =
      /^(\p{Nd}{4})\s+([^\s]+)\s+(\p{Nd}{1,2})\s+गते\s+(\p{Nd}{2}:\p{Nd}{2})(?:\s+अगाडि)?$/u;
    const match = cleanedDateString.match(regex);

    if (!match) {
      console.warn(`Invalid date format (regex failed): "${dateString}"`);
      return null;
    }

    const [, yearStr, monthName, dayStr, timeStr] = match;

    const normalizedYear = normalizeNepaliDigits(yearStr);
    const normalizedDay = normalizeNepaliDigits(dayStr);
    const normalizedTime = normalizeNepaliDigits(timeStr);

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

    const [hoursStr, minutesStr] = normalizedTime.split(":");
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;
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
