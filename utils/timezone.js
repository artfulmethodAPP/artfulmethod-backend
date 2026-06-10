"use strict";

// Timezone utilities.
//
// Policy: store all timestamps in UTC (the DB default). Convert to the user's
// IANA timezone (e.g. "Asia/Karachi") only when presenting times to the user.
// The user's timezone is captured from the client at register/login.

// Validate an IANA timezone string. Returns the zone if valid, else null.
const sanitizeTimezone = (tz) => {
  if (!tz || typeof tz !== "string") return null;
  const value = tz.trim();
  if (!value) return null;
  try {
    // Throws RangeError for an unknown timezone identifier.
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return value;
  } catch {
    return null;
  }
};

// Pull the timezone a request is carrying: prefer the body field, fall back to
// an X-Timezone header. Returns a valid IANA zone or null.
const timezoneFromRequest = (body = {}, headers = {}) =>
  sanitizeTimezone(body.timezone) ||
  sanitizeTimezone(headers["x-timezone"]);

// The local calendar date (YYYY-MM-DD) for a UTC instant in the given zone.
// Used for streak day boundaries. Falls back to UTC.
const localDateString = (date, tz) => {
  const zone = sanitizeTimezone(tz) || "UTC";
  // en-CA formats as ISO "YYYY-MM-DD"; timeZone shifts the clock into `zone`.
  return new Date(date).toLocaleDateString("en-CA", { timeZone: zone });
};

// Format a UTC timestamp for display in the user's timezone (ISO-like local string).
// Returns null for nullish input.
const toUserLocal = (date, tz) => {
  if (!date) return null;
  const zone = sanitizeTimezone(tz) || "UTC";
  // e.g. "2026-06-05 14:30" in the user's zone.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(date));
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
};

module.exports = {
  sanitizeTimezone,
  timezoneFromRequest,
  localDateString,
  toUserLocal,
};
