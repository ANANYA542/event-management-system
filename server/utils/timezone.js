const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);


const toUTC = (dateTime, tz) => {
  return dayjs.tz(dateTime, tz).utc().toDate();
};
const fromUTC = (utcDate, tz) => {
    return dayjs.utc(utcDate).tz(tz).format("YYYY-MM-DD HH:mm");
  };

module.exports = { toUTC,fromUTC };