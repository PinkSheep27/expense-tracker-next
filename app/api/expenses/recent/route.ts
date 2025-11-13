import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses, categories } from '@/lib/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getDateRange } from '@/lib/date-helpers';

// GET /api/expenses/recent?period=thisWeek
// Pre-built endpoint for common time periods
// Easier than calculating dates on frontend
export async function GET(request: NextRequest) {
  // Step 1: Authenticate
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }
  
  const { userId } = authResult;
  
  // Step 2: Get the period parameter (default to 'thisMonth')
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'thisMonth';

  // Step 3: Use helper function to get date range
  // Returns { startDate: Date, endDate: Date } or null
  const dateRange = getDateRange(period);
  
  // Step 4: Validate period
  if (!dateRange) {
    return NextResponse.json(
      { error: 'Invalid period. Valid options: today, yesterday, thisWeek, thisMonth, lastMonth, last30Days, last90Days, thisYear' }, 
      { status: 400 }
    );
  }

  // Step 5: Query expenses within date range
  const userExpenses = await db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
      },
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(
      and(
        eq(expenses.userId, userId),           // Always filter by user
        gte(expenses.date, dateRange.startDate) // Date >= startDate
        // Note: We don't filter by endDate here because getDateRange already sets endDate to 'now'
      )
    )
    .orderBy(desc(expenses.date));

  // Step 6: Return results with metadata
  return NextResponse.json({
    expenses: userExpenses,
    count: userExpenses.length,
    period,
    dateRange: {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString()
    }
  });
}