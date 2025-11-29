/**
 * Date/time utilities for consistent timezone-aware formatting across the app.
 */

/**
 * Returns the user's timezone using the browser Intl API.
 */
export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Normalizes a database timestamp string to an ISO 8601 format that preserves the UTC offset.
 * Accepts inputs like "2025-10-12 04:38:44.086+00" and converts to "2025-10-12T04:38:44.086+00".
 */
export function normalizeDbTimestamp(input: string): string {
  if (!input) return input;
  let s = input.includes('T') ? input : input.replace(' ', 'T');
  // Normalize short UTC offsets to valid ISO
  if (s.endsWith('+00')) s = s.replace(/\+00$/, 'Z');
  if (s.endsWith('+0000')) s = s.replace(/\+0000$/, 'Z');
  return s;
}

/**
 * Formats a timestamp as Today/Yesterday/Absolute using the user's timezone.
 * - Today: "Today, hh:mm AM/PM"
 * - Yesterday: "Yesterday, hh:mm AM/PM"
 * - Else: "MMM d, yyyy, hh:mm AM/PM"
 */
export function formatInboxTimestamp(isoLike: string, timeZone?: string): string {
  try {
    const tz = timeZone || getUserTimeZone();
    const normalized = normalizeDbTimestamp(isoLike);
    const date = new Date(normalized);
    const now = new Date();

    const fmtDay = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    const fmtTime = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true });
    const fmtAbs = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

    const dayNow = fmtDay.format(now);
    const dayTs = fmtDay.format(date);

    // Compute yesterday in the user's timezone by subtracting one day from 'now'
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayYest = fmtDay.format(yesterday);

    if (dayTs === dayNow) {
      return `Today, ${fmtTime.format(date)}`;
    }
    if (dayTs === dayYest) {
      return `Yesterday, ${fmtTime.format(date)}`;
    }
    return fmtAbs.format(date);
  } catch {
    return 'Unknown time';
  }
}

/**
 * Formats a timestamp as an absolute date/time in the user’s timezone.
 * Example: "Nov 16, 2025, 11:41 PM".
 */
export function formatAbsoluteTimestamp(isoLike: string, timeZone?: string): string {
  try {
    const tz = timeZone || getUserTimeZone();
    const normalized = normalizeDbTimestamp(isoLike);
    const date = new Date(normalized);
    const fmtAbs = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    return fmtAbs.format(date);
  } catch {
    return 'Unknown time';
  }
}