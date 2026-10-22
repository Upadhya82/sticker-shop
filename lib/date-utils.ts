// Utility functions for safe local date and time handling without UTC offset shifts

/**
 * Parses YYYY-MM-DD into a local Date object (at 00:00:00 local time)
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Returns today's date in YYYY-MM-DD format using local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD string into a friendly localized display string
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Checks if a YYYY-MM-DD date is today or in the future
 */
export function isFutureOrTodayDate(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr >= getTodayDateString();
}

/**
 * Checks if a specific time slot on a given date has already passed
 * @param dateStr YYYY-MM-DD
 * @param timeSlot24h e.g. "09:00", "14:00"
 */
export function isTimeSlotInPast(dateStr: string, timeSlot24h: string): boolean {
  const todayStr = getTodayDateString();
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  // Same day: check current time
  const now = new Date();
  const [slotHour, slotMin] = timeSlot24h.split(":").map(Number);
  const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotHour, slotMin, 0);
  return now > slotDate;
}

/**
 * Converts "09:00 AM" or "01:00 PM" to "09:00" or "13:00"
 */
export function convertTo24Hour(time12h: string): string {
  if (!time12h) return "";
  const parts = time12h.split(" ");
  if (parts.length < 2) return time12h; // already 24h
  const [time, period] = parts;
  const [hoursRaw, minutes] = time.split(":").map(Number);
  let hours = hoursRaw;

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Converts "09:00" or "13:00" to "09:00 AM" or "01:00 PM"
 */
export function convertTo12Hour(time24h: string): string {
  if (!time24h) return "";
  if (time24h.includes("AM") || time24h.includes("PM")) return time24h;
  const [hoursRaw, minutes] = time24h.split(":").map(Number);
  const period = hoursRaw >= 12 ? "PM" : "AM";
  let hours = hoursRaw;

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

