/**
 * Format date to locale string
 */
export function formatDate(date, locale = 'th-TH') {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time to locale string
 */
export function formatTime(date, locale = 'th-TH') {
  return new Date(date).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Get calendar days for a month
 */
export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Add empty slots for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

/**
 * Get month name
 */
export function getMonthName(month, locale = 'th-TH') {
  return new Date(2000, month, 1).toLocaleDateString(locale, { month: 'long' });
}

/**
 * Get day names for calendar header
 */
export function getDayNames(locale = 'th-TH') {
  const days = [];
  const baseDate = new Date(2024, 0, 7); // A Sunday
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(baseDate);
    day.setDate(baseDate.getDate() + i);
    days.push(
      day.toLocaleDateString(locale, { weekday: 'short' })
    );
  }
  
  return days;
}
