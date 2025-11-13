import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses, categories } from '@/lib/db/schema';
import { eq, desc, and, gte, lte, inArray, sql } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/expenses?page=1&pageSize=20
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }
  
  const { userId } = authResult;

  try {
    // Step 1: Parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');           // Default: page 1
    const pageSize = parseInt(searchParams.get('pageSize') || '20');  // Default: 20 per page
    
    // Filter parameters (same as before)
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryIds = searchParams.get('categoryIds')?.split(',');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    // Step 2: Validate pagination parameters
    // Prevent negative page numbers or unreasonably large page sizes
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, pageSize must be 1-100' },
        { status: 400 }
      );
    }

    // Step 3: Build WHERE conditions (same as Section 2)
    const conditions = [eq(expenses.userId, userId)];

    if (startDate) {
      conditions.push(gte(expenses.date, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(expenses.date, new Date(endDate)));
    }
    if (categoryIds && categoryIds.length > 0) {
      conditions.push(inArray(expenses.categoryId, categoryIds));
    }
    if (minAmount) {
      conditions.push(gte(expenses.amount, minAmount));
    }
    if (maxAmount) {
      conditions.push(lte(expenses.amount, maxAmount));
    }

    // Step 4: Get total count (for pagination metadata)
    // We need to know total number of expenses to calculate total pages
    const countResult = await db
      .select({ 
        count: sql<number>`COUNT(*)` 
      })
      .from(expenses)
      .where(and(...conditions));
    
    const totalCount = countResult[0].count || 0;

    // Step 5: Calculate pagination values
    // OFFSET = how many rows to skip
    // Example: Page 3, pageSize 20 → skip first 40 rows
    const offset = (page - 1) * pageSize;
    
    // Total pages = ceiling(total / pageSize)
    // Example: 95 expenses, 20 per page → Math.ceil(95/20) = 5 pages
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Is there a next page?
    const hasNextPage = page < totalPages;
    
    // Is there a previous page?
    const hasPreviousPage = page > 1;

    // Step 6: Query expenses for this page
    const userExpenses = await db
      .select({
        id: expenses.id,
        userId: expenses.userId,
        amount: expenses.amount,
        description: expenses.description,
        date: expenses.date,
        receiptUrl: expenses.receiptUrl,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          icon: categories.icon,
        },
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(expenses.date))
      // LIMIT = how many rows to return
      .limit(pageSize)
      // OFFSET = how many rows to skip
      .offset(offset);

    // Step 7: Return paginated results with metadata
    return NextResponse.json({
      // The actual expenses for this page
      expenses: userExpenses,
      
      // Pagination metadata (frontend needs this for "Next/Previous" buttons)
      pagination: {
        page,                    // Current page number
        pageSize,                // Items per page
        totalCount,              // Total number of expenses
        totalPages,              // Total number of pages
        hasNextPage,             // Can we go to next page?
        hasPreviousPage,         // Can we go to previous page?
      },
      
      // Applied filters
      filters: {
        startDate,
        endDate,
        categoryIds,
        minAmount,
        maxAmount,
      }
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}