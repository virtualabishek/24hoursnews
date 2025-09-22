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

    // Normalize Nepali digits
    cleaned = normalizeNepaliDigits(cleaned);

    // Log for debug
    console.log(`Setopati cleaned date: "${cleaned}"`);

    // Extract time
    let timePart = null;
    const timeMatch = cleaned.match(/\s+(\d{1,2}:\d{2})\s*$/);
    if (timeMatch) {
      timePart = timeMatch[1];
      cleaned = cleaned.replace(timeMatch[0], "").trim();
      console.log(`Extracted time: ${timePart}`);
    } else {
      console.warn(
        `No time found in "${cleaned}", using current time as fallback`
      );
      timePart = new Date()
        .toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(" ", "");
    }

    // Flexible regex for date
    const regex = /^[^,]+,\s*([^\s,]+)\s+(\d{1,2}),\s*(\d{4})$/;
    const match = cleaned.match(regex);

    if (!match) {
      console.warn(
        `Invalid Setopati date format after normalize: "${dateString}" -> "${cleaned}"`
      );
      return null;
    }

    const [, monthName, dayStr, yearStr] = match;

    const bsDay = parseInt(dayStr, 10);
    const bsYear = parseInt(yearStr, 10);
    const bsMonth = nepaliMonthMap[monthName];

    if (isNaN(bsDay) || isNaN(bsYear) || !bsMonth) {
      console.warn(
        `Could not parse Setopati date components: month="${monthName}", day=${bsDay}, year=${bsYear}`
      );
      return null;
    }

    const nepaliDate = new NepaliDate(bsYear, bsMonth - 1, bsDay);
    const adDate = nepaliDate.toJsDate();

    // Parse and set time without manual timezone adjustment
    const [hoursStr, minutesStr] = timePart.split(":");
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;
    adDate.setHours(hours, minutes, 0, 0);

    if (isNaN(adDate.getTime())) {
      console.warn(`Invalid Gregorian date from Setopati: ${dateString}`);
      return null;
    }

    console.log(
      `Parsed Setopati "${dateString}" to AD: ${adDate.toISOString()}`
    );
    return adDate;
  } catch (err) {
    console.error(`Fatal error parsing Setopati date: ${dateString}`, err);
    return null;
  }
}
