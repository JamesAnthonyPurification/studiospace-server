export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// 24:00 is allowed as an end time so a session can run until midnight.
export const TIME_RE = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;

export const OPENING_MINUTES = 6 * 60; // studios open at 06:00
export const CLOSING_MINUTES = 24 * 60; // and close at midnight

export function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Builds a Date for a studio-local slot. Times are stored as naive UTC so
 * overlap checks compare like with like regardless of the server's timezone.
 */
export function slotDate(date, minutes) {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) + minutes * 60_000);
}

export function isValidCalendarDate(date) {
  if (!DATE_RE.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date);
}
