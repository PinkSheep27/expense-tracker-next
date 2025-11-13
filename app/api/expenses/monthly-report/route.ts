import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses, categories } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/expenses/monthly-report?year=2025
// Returns spending for each month of the year
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }
  
  const { userId } = authResult;

  try {
    // Step 1: Get year parameter (default to current year)
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Step 2: Query expenses grouped by month
    // EXTRACT(MONTH FROM date) gets the month number (1-12) from a date
    // Example: '2025-03-15' → month = 3 (March)
    const monthlyData = await db
      .select({
        // Extract month number from date (1 = Jan, 2 = Feb, etc.)
        month: sql<number>`EXTRACT(MONTH FROM ${expenses.date})`,
        
        // Aggregations for this month
        total: sql<number>`SUM(${expenses.amount})`,
        count: sql<number>`COUNT(*)`,
        average: sql<number>`AVG(${expenses.amount})`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          // Filter for expenses in the specified year
          // EXTRACT(YEAR FROM date) = 2025
          sql`EXTRACT(YEAR FROM ${expenses.date}) = ${year}`
        )
      )
      // GROUP BY month - calculate totals for each month separately
      .groupBy(sql`EXTRACT(MONTH FROM ${expenses.date})`)
      // ORDER BY month so we get Jan, Feb, Mar... in order
      .orderBy(sql`EXTRACT(MONTH FROM ${expenses.date})`);

    // Step 3: Create array for all 12 months
    // Some months might have no expenses, so we initialize with 0
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Create an object for each month (even if no data)
    const allMonths = monthNames.map((name, index) => {
      // Find data for this month (index + 1 because months are 1-12, not 0-11)
      const data = monthlyData.find(m => m.month === index + 1);
      
      return {
        month: index + 1,           // Month number (1-12)
        monthName: name,            // Month name (January, February, etc.)
        total: parseFloat(data?.total?.toString() || '0'),
        count: data?.count || 0,
        average: parseFloat(data?.average?.toString() || '0'),
      };
    });

    // Step 4: Calculate year total
    const yearTotal = allMonths.reduce((sum, month) => sum + month.total, 0);

    return NextResponse.json({
      year,
      yearTotal,
      months: allMonths,
    });

  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly report' },
      { status: 500 }
    );
  }
}