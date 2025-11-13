import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/categories
// Fetch all categories for the authenticated user
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }
  
  const { userId } = authResult;

  try {
    // Get user's categories, ordered by creation date
    const userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(desc(categories.createdAt));

    return NextResponse.json({
      categories: userCategories,
      count: userCategories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories
// Create a new category for the authenticated user
export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }
  
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { name, color, icon } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category with this name already exists for this user
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .limit(100); // Get all user's categories to check
    
    const duplicate = existing.find(
      cat => cat.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Create the category
    const newCategory = await db
      .insert(categories)
      .values({
        userId,
        name,
        color: color || '#95A5A6', // Default gray
        icon: icon || '📌', // Default pin icon
      })
      .returning();

    return NextResponse.json({
      message: 'Category created successfully',
      category: newCategory[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}