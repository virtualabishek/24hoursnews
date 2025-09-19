import NepaliDate from "nepali-date-converter";

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
    const parts = dateString.trim().split(/\s+/);
    if (parts.length < 4) {
      console.warn(`Invalid date format: ${dateString}`);
      return null;
    }

    const bsYear = parseInt(parts[0], 10);
    const bsMonthName = parts[1];
    const bsDay = parseInt(parts[2], 10);
    const time = parts[4] || "00:00";

    if (!nepaliMonthMap[bsMonthName]) {
      console.warn(`Invalid month name: ${bsMonthName}`);
      return null;
    }

    const bsMonth = nepaliMonthMap[bsMonthName];
    const nepaliDate = new NepaliDate(bsYear, bsMonth - 1, bsDay);
    const adDate = nepaliDate.getAD();

    const [hoursStr, minutesStr] = time.split(":");
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;

    return new Date(adDate.year, adDate.month - 1, adDate.day, hours, minutes);
  } catch (err) {
    console.error(`Failed to parse date: ${dateString}`, err);
    return null;
  }
}
