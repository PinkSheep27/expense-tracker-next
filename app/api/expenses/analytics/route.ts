import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses, categories } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/expenses/analytics?startDate=2025-01-01&endDate=2025-01-31
// Returns spending statistics and breakdowns
export async function GET(request: NextRequest) {
  // Step 1: Authenticate the request
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }
  
  const { userId } = authResult;

  try {
    // Step 2: Parse query parameters for date range (optional)
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Step 3: Build WHERE conditions
    // Start with userId (always required for data isolation)
    const conditions = [eq(expenses.userId, userId)];

    // Add date filters if provided
    if (startDate) {
      conditions.push(gte(expenses.date, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(expenses.date, new Date(endDate)));
    }

    // Step 4: Calculate overall statistics
    // This query gets SUM, COUNT, AVG, MAX, MIN all at once
    const overallStats = await db
      .select({
        // SUM - total of all amounts
        // sql<number> tells TypeScript the result is a number
        // We use sql.raw because Drizzle doesn't have built-in SUM function
        total: sql<number>`SUM(${expenses.amount})`,
        
        // COUNT - how many expenses
        count: sql<number>`COUNT(*)`,
        
        // AVG - average expense amount
        average: sql<number>`AVG(${expenses.amount})`,
        
        // MAX - highest expense
        highest: sql<number>`MAX(${expenses.amount})`,
        
        // MIN - lowest expense
        lowest: sql<number>`MIN(${expenses.amount})`,
      })
      .from(expenses)
      .where(and(...conditions));

    // Step 5: Get spending breakdown by category
    // GROUP BY categoryId means: calculate SUM for each category separately
    const byCategory = await db
      .select({
        // Category information
        categoryId: expenses.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryIcon: categories.icon,
        
        // Aggregations for this category
        // SUM(amount) for all expenses in this category
        total: sql<number>`SUM(${expenses.amount})`,
        
        // COUNT(*) for all expenses in this category
        count: sql<number>`COUNT(*)`,
        
        // AVG(amount) for expenses in this category
        average: sql<number>`AVG(${expenses.amount})`,
      })
      .from(expenses)
      // JOIN categories to get category names/colors
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(...conditions))
      // GROUP BY category - this is the key!
      // It says: "organize expenses by category, then calculate aggregations for each group"
      .groupBy(expenses.categoryId, categories.name, categories.color, categories.icon);

    // Step 6: Calculate percentages for each category
    // What % of total spending does each category represent?
    const totalSpending = overallStats[0].total || 0;
    
    const categoryBreakdown = byCategory.map(cat => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      categoryColor: cat.categoryColor,
      categoryIcon: cat.categoryIcon,
      total: parseFloat(cat.total?.toString() || '0'),
      count: cat.count,
      average: parseFloat(cat.average?.toString() || '0'),
      // Calculate percentage: (category total / overall total) * 100
      // Round to 1 decimal place
      percentage: totalSpending > 0 
        ? Math.round((parseFloat(cat.total?.toString() || '0') / totalSpending) * 1000) / 10
        : 0
    }));

    // Step 7: Sort categories by total (highest spending first)
    categoryBreakdown.sort((a, b) => b.total - a.total);

    // Step 8: Return analytics
    return NextResponse.json({
      // Overall statistics
      overall: {
        total: parseFloat(overallStats[0].total?.toString() || '0'),
        count: overallStats[0].count || 0,
        average: parseFloat(overallStats[0].average?.toString() || '0'),
        highest: parseFloat(overallStats[0].highest?.toString() || '0'),
        lowest: parseFloat(overallStats[0].lowest?.toString() || '0'),
      },
      // Breakdown by category (with percentages)
      byCategory: categoryBreakdown,
      // Date range applied
      dateRange: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Error calculating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate analytics' },
      { status: 500 }
    );
  }
}