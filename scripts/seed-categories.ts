import { db } from '../lib/db';
import { categories } from '../lib/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Default categories for new users
const defaultCategories = [
  { name: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
  { name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
  { name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
  { name: 'Entertainment', color: '#FFA07A', icon: '🎬' },
  { name: 'Bills & Utilities', color: '#98D8C8', icon: '💡' },
  { name: 'Healthcare', color: '#F7DC6F', icon: '⚕️' },
  { name: 'Travel', color: '#BB8FCE', icon: '✈️' },
  { name: 'Education', color: '#85C1E2', icon: '📚' },
  { name: 'Personal Care', color: '#F8B500', icon: '💅' },
  { name: 'Other', color: '#95A5A6', icon: '📌' },
];

async function seedCategories(userId: string) {
  try {
    console.log(`Seeding categories for user: ${userId}`);
    
    // Insert default categories for this user
    const insertedCategories = await db
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
    
    console.log(`Created ${insertedCategories.length} categories`);
    
    insertedCategories.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name} (${cat.color})`);
    });
    
    return insertedCategories;
  } catch (error) {
    console.error('Failed to seed categories:', error);
    throw error;
  }
}

// Get userId from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: npx tsx scripts/seed-categories.ts <userId>');
  console.error('   Get userId from Auth0 token or database');
  process.exit(1);
}

seedCategories(userId).then(() => {
  console.log('\n Categories seeded successfully!');
  process.exit(0);
}).catch(() => {
  process.exit(1);
});