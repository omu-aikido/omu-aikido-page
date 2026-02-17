import type { Event } from "./types";

/**
 * Parses event dates and adjusts the end date for range calculations.
 * We subtract 1 minute from the end date to handle exclusive boundaries naturally.
 * e.g.
 * - 00:00 end -> 23:59 previous day (belongs to previous day)
 * - 10:00 end -> 09:59 (belongs to same day)
 */
export function getEventDateRange(event: Event) {
  // Check if it's an All Day event (UTC midnight)
  if (isAllDayEvent(event)) {
    const start = new Date(event.start);
    const end = new Date(event.end);

    // Treat UTC date parts as Local date parts
    // This effectively ignores the timezone shift for All Day events
    const startDate = new Date(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate()
    );
    const endDate = new Date(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate()
    );

    // Subtract 1 minute
    endDate.setMinutes(endDate.getMinutes() - 1);

    return { startDate, endDate };
  }

  // For timed events, use standard parsing (Local Time with timezone shift)
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  // Subtract 1 minute
  endDate.setMinutes(endDate.getMinutes() - 1);

  return { startDate, endDate };
}

/**
 * Determines if an event is an "All Day" event.
 * Defined as starting at 00:00 and ending at 00:00 (original time).
 */
export function isAllDayEvent(event: Event): boolean {
  const start = new Date(event.start);
  const end = new Date(event.end);

  // Check if both start and end are at midnight UTC
  const isStartMidnight =
    start.getUTCHours() === 0 &&
    start.getUTCMinutes() === 0 &&
    start.getUTCSeconds() === 0 &&
    start.getUTCMilliseconds() === 0;

  const isEndMidnight =
    end.getUTCHours() === 0 &&
    end.getUTCMinutes() === 0 &&
    end.getUTCSeconds() === 0 &&
    end.getUTCMilliseconds() === 0;

  return isStartMidnight && isEndMidnight;
}

export function isMultiDayEvent(event: Event): boolean {
  const { startDate, endDate } = getEventDateRange(event);
  
  return (
    startDate.getFullYear() !== endDate.getFullYear() ||
    startDate.getMonth() !== endDate.getMonth() ||
    startDate.getDate() !== endDate.getDate()
  );
}

/**
 * Formats the date range string.
 * e.g., "2月1日", "2月23日 - 2月27日"
 */
export function formatEventDateRange(event: Event): string {
  const { startDate, endDate } = getEventDateRange(event);

  const format = (d: Date) =>
    d.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });

  if (
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate()
  ) {
    return format(startDate);
  }

  return `${format(startDate)} - ${format(endDate)}`;
}

/**
 * Formats the time string.
 */
export function formatEventTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
