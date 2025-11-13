export function getDateRange(period: string): { startDate: Date; endDate: Date } | null {
  const now = new Date(); // Current date and time
  
  // Get today at midnight (00:00:00)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      // From today at 00:00:00 to today at 23:59:59
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // Add 24 hours minus 1ms
      };

    case 'yesterday':
      // Get yesterday's date
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1); // Subtract 1 day
      return {
        startDate: yesterday,
        endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      };

    case 'thisWeek':
      // From Sunday (start of week) to now
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // getDay() returns 0-6 (Sunday-Saturday)
      return {
        startDate: weekStart,
        endDate: now
      };

    case 'thisMonth':
      // From first day of current month to now
      // new Date(year, month, 1) gives first day of month
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: now
      };

    case 'lastMonth':
      // From first day of last month to last day of last month
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of last month
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);   // Day 0 = last day of previous month
      return {
        startDate: lastMonth,
        endDate: lastMonthEnd
      };

    case 'last30Days':
      // From 30 days ago to now
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30); // Subtract 30 days
      return {
        startDate: thirtyDaysAgo,
        endDate: now
      };

    case 'last90Days':
      // From 90 days ago to now
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);
      return {
        startDate: ninetyDaysAgo,
        endDate: now
      };

    case 'thisYear':
      // From January 1st of current year to now
      return {
        startDate: new Date(now.getFullYear(), 0, 1), // Month 0 = January
        endDate: now
      };

    default:
      // Return null if period is not recognized
      return null;
  }
}

// Format a Date object as YYYY-MM-DD string
// Used for API query parameters
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // "2025-01-15T10:30:00Z" → "2025-01-15"
}