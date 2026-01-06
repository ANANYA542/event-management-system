import dayjs from "../lib/dayjs";

export const formatTzLabel = (tz, timezoneOptions) =>
  timezoneOptions.find((item) => item.value === tz)?.label || tz;

export const formatDateLabel = (utcDate, viewTimezone) =>
  utcDate
    ? dayjs.utc(utcDate).tz(viewTimezone).format("MMM DD, YYYY [at] hh:mm A")
    : "--";

export const formatDateOnly = (utcDate, viewTimezone) =>
  utcDate ? dayjs.utc(utcDate).tz(viewTimezone).format("MMM DD, YYYY") : "--";

export const formatTimeOnly = (utcDate, viewTimezone) =>
  utcDate ? dayjs.utc(utcDate).tz(viewTimezone).format("hh:mm A") : "--";

export const getDateLabel = (utcValue, dateTimeValue, eventTimezone, viewTimezone, DEFAULT_TIMEZONE) => {
  if (utcValue) {
    return formatDateOnly(utcValue, viewTimezone);
  }
  if (dateTimeValue) {
    const eventTz = eventTimezone || DEFAULT_TIMEZONE;
    return dayjs.tz(dateTimeValue, eventTz).tz(viewTimezone).format("MMM DD, YYYY");
  }
  return "";
};

export const getTimeLabel = (utcValue, dateTimeValue, eventTimezone, viewTimezone, DEFAULT_TIMEZONE) => {
  if (utcValue) {
    return formatTimeOnly(utcValue, viewTimezone);
  }
  if (dateTimeValue) {
    const eventTz = eventTimezone || DEFAULT_TIMEZONE;
    return dayjs.tz(dateTimeValue, eventTz).tz(viewTimezone).format("hh:mm A");
  }
  return "";
};

