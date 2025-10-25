'use client'

import { useState } from 'react'
import Link from 'next/link'
import ExpenseForm from '@/components/ExpenseForm/ExpenseForm'
import ExpenseList from '@/components/ExpenseList/ExpenseList'
import ExpenseSummary from '@/components/ExpenseSummary/ExpenseSummary'
import Header from '@/components/Header/Header'
import { type ExpenseCategory } from '@/components/ExpenseCard/ExpenseCard'

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  receiptUrl?: string;
}

export default function ExpensesPage() {
    // State management - SAME as Vite!
    const [expenses, setExpenses] = useState<Expense[]>([
        {
        id: 1,
        description: "Lunch at downtown cafe",
        amount: 12.50,
        category: "Food",
        date: "2024-01-15"
        },
        {
        id: 2,
        description: "Monthly bus pass",
        amount: 95.00,
        category: "Transportation", 
        date: "2024-01-14"
        },
        {
        id: 3,
        description: "Movie tickets",
        amount: 25.00,
        category: "Entertainment", 
        date: "2024-01-13"
        }
    ]);

    const handleAddExpense = (expenseData: Omit<Expense, 'id'>): void => {
        const newExpense: Expense = {
        ...expenseData,
        id: Date.now()
        };
        setExpenses(prev => [...prev, newExpense]);
    };

    const handleDeleteExpense = (id: number): void => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    };

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-5">
        <Header 
          title="Expense Tracker" 
          subtitle="Manage your spending with confidence" 
        />
        
        <main className="space-y-6">
          <ExpenseSummary 
            totalAmount={totalAmount}
            expenseCount={expenses.length}
            period="This Month"
          />
          
          <ExpenseForm onSubmit={handleAddExpense} />
          
          <ExpenseList 
            expenses={expenses} 
            onDeleteExpense={handleDeleteExpense} 
          />
        </main>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-2">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}