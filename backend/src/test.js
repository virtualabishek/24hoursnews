import NepaliDateConverter from "nepali-date-converter";
const testDate = new Date("2025-10-22T06:15:00.000Z");
const bsObj = NepaliDateConverter.adToBs(testDate);
console.log(bsObj); // Should output { year: 2082, month: 6, day: 5, ... }
