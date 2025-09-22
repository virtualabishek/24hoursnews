import NepaliDate from "nepali-date";

export function adToNepaliDateString(adDate) {
  const nDate = new NepaliDate(adDate);
  return `${nDate.getYear()}-${nDate.getMonth() + 1}-${nDate.getDate()}`;
}
