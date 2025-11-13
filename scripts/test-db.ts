import { db } from '../lib/db';
import { expenses } from '../lib/db/schema';

async function testDatabase() {
  try {
    console.log('Testing database connection...');

    const result = await db.select().from(expenses);
    
    console.log('Database connection successful!');
    console.log(`Found ${result.length} expenses in database`);
    
    console.log('\n Expenses table schema:');
    console.log('  - id (uuid, primary key)');
    console.log('  - userId (text, not null)');
    console.log('  - amount (decimal, not null)');
    console.log('  - category (varchar, not null)');
    console.log('  - description (text, nullable)');
    console.log('  - date (timestamp, not null)');
    console.log('  - receiptUrl (text, nullable)');
    console.log('  - createdAt (timestamp, default now)');
    console.log('  - updatedAt (timestamp, default now)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testDatabase();