import { pgTable, uuid, text, decimal, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Categories table - stores available expense categories
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Updated expenses table - now references categories table
export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  categoryId: uuid('category_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  // Each expense belongs to one category
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  expenses: many(expenses),
}));

// TypeScript types
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;