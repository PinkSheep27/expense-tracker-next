import { db } from '../lib/db';
import { expenses, categories } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrateExpenses() {
  try {
    console.log('Starting expense migration...');
    
    // Get all unique user IDs from expenses
    const allExpenses = await db.select().from(expenses);
    const userIds = [...new Set(allExpenses.map(e => e.userId))];
    
    console.log(`Found ${userIds.length} users with expenses`);
    
    for (const userId of userIds) {
      console.log(`\n Processing user: ${userId}`);
      
      // Get or create categories for this user
      let userCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId));
      
      if (userCategories.length === 0) {
        console.log('  Creating default categories...');
        // Seed categories for this user
        const defaultCategories = [
          { name: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
          { name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
          { name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
          { name: 'Entertainment', color: '#FFA07A', icon: '🎬' },
          { name: 'Other', color: '#95A5A6', icon: '📌' },
        ];
        
        userCategories = await db
          .insert(categories)
          .values(
            defaultCategories.map(cat => ({
              userId,
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
            }))
          )
          .returning();
      }
      
      // Get user's expenses that need migration
      // (This assumes you haven't run the migration yet and still have the 'category' text column)
      const userExpenses = allExpenses.filter(e => e.userId === userId);
      
      console.log(`  Migrating ${userExpenses.length} expenses...`);
      
      // Map old category names to new category IDs
      const categoryMap = new Map(
        userCategories.map(cat => [cat.name.toLowerCase(), cat.id])
      );
      
      // Get "Other" category as fallback
      const otherCategory = userCategories.find(c => c.name === 'Other');
      
      for (const expense of userExpenses) {
        // Match old text category to new category ID
        // Note: This assumes your old schema had a 'category' text field
        const oldCategory = (expense as any).category?.toLowerCase() || '';
        let categoryId = categoryMap.get(oldCategory) || otherCategory?.id;
        
        // If no match found, use "Other" category
        if (!categoryId) {
          categoryId = userCategories[userCategories.length - 1].id;
        }
        
        // Update expense with category ID
        await db
          .update(expenses)
          .set({ categoryId })
          .where(eq(expenses.id, expense.id));
      }
      
      console.log(`  Migrated ${userExpenses.length} expenses`);
    }
    
    console.log('\n All expenses migrated successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrateExpenses().then(() => {
  process.exit(0);
}).catch(() => {
  process.exit(1);
});