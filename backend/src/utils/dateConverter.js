import NepaliDateConverter from "nepali-date-converter";
const NepaliDate = NepaliDateConverter;

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

export function parseOnlineKhabarDate(dateString) {
  try {
    if (!dateString || typeof dateString !== "string") {
      console.warn("Invalid dateString received:", dateString);
      return null;
    }

    // Normalize spaces
    const cleanedDateString = dateString.replace(/\s+/g, " ").trim();
    // Match format: "YYYY Month DD गते HH:MM"
    const regex = /^(\d{4})\s+([^\s]+)\s+(\d{1,2})\s+गते\s+(\d{2}:\d{2})$/;
    const match = cleanedDateString.match(regex);

    if (!match) {
      console.warn(`Invalid date format (regex failed): ${dateString}`);
      return null;
    }

    const [, bsYearStr, bsMonthName, bsDayStr, time] = match;

    const bsYear = parseInt(bsYearStr, 10);
    const bsDay = parseInt(bsDayStr, 10);
    const bsMonth = nepaliMonthMap[bsMonthName];

    if (isNaN(bsYear) || isNaN(bsDay) || !bsMonth) {
      console.warn(
        `Could not parse components: Y:${bsYear}, M:${bsMonth}, D:${bsDay}`
      );
      return null;
    }

    const nepaliDate = new NepaliDate(bsYear, bsMonth - 1, bsDay);
    const adDate = nepaliDate.toJsDate();

    const [hours, minutes] = time.split(":").map(Number);
    adDate.setHours(hours || 0);
    adDate.setMinutes(minutes || 0);

    // Validate the resulting date
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
