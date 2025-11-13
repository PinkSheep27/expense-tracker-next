import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }
  
  const { userId } = authResult;

  try {
    const expense = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.id, params.id),
          eq(expenses.userId, userId)
        )
      );

    if (expense.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense[0]);

  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }
  
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { amount, category, description, date, receiptUrl } = body;

    const updated = await db
      .update(expenses)
      .set({
        amount: amount?.toString(),
        category,
        description,
        date: date ? new Date(date) : undefined,
        receiptUrl,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(expenses.id, params.id),
          eq(expenses.userId, userId)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Expense updated successfully',
      expense: updated[0]
    });

  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }
  
  const { userId } = authResult;

  try {
    const deleted = await db
      .delete(expenses)
      .where(
        and(
          eq(expenses.id, params.id),
          eq(expenses.userId, userId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Expense deleted successfully',
      expense: deleted[0]
    });

  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}