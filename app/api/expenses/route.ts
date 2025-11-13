import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth-middleware'; 

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if(!authResult.authenticated) return authResult.error;

  const { userId } = authResult;

  try
  {
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date))
    return NextResponse.json({
      expenses: userExpenses,
      count: userExpenses.length
    })
  }
  catch(error)
  {
    console.error('Error fetching expenses: ', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses'},
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if(!authResult.authenticated) return authResult.error;

  const { userId } = authResult;
  
  try {
    const body = await request.json();
    const { amount, category, description, date, receiptUrl } = body;

    if(!amount || !category || !date)
    {
      return NextResponse.json(
        { error: 'Amount, category, and date are required' },
        { status: 400 }
      );
    }

    const newExpense = await db
      .insert(expenses)
      .values({
        userId,
        amount: amount.toString(),
        category,
        description: description || null,
        date: new Date(date),
        receiptUrl: receiptUrl || null
      })
      .returning();
    
    return NextResponse.json({
      message: 'Expense created successfully',
      expense: newExpense[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense'},
      { status: 500 }
    );
  }
}