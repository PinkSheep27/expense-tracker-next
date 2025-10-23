'use client'

import React, { useState } from 'react';
import ExpenseCard from '@/components/ExpenseCard/ExpenseCard';
import type { ExpenseCardProps, ExpenseCategory } from '@/components/ExpenseCard/ExpenseCard';

// Type for expense data (reusing interface from ExpenseCard)
type Expense = ExpenseCardProps;
type FilterOption = 'All' | ExpenseCategory;

interface ExpenseListProps {
  expenses: Expense[];  // FIXED: Required prop, receives current state from App
  onDeleteExpense?: (id:number) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense }) => {
  
  // ONLY manage UI state (filtering) - NOT expense data
  const [filterCategory, setFilterCategory] = useState<FilterOption>('All');

  // Filter expenses from props (not local state)
  const filteredExpenses = filterCategory === 'All' 
    ? expenses  // Use expenses from props
    : expenses.filter(expense => expense.category === filterCategory);

  // Calculate total for the currently filtered expenses
  const filteredTotal = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(event.target.value as FilterOption);
  };

   return (
    <div className="
    bg-white shadow-sm rounded-lg p-6 mb-8
    border border-gray-200
    ">
      <div className="space-y-3">
        <h2 className="
          text-2xl font-bold text-gray-900 mb-6
          ">
          Your Expenses
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700"
          htmlFor="category-filter">
            Filter by category:
            </label>
          <select 
            id="category-filter"
            value={filterCategory}
            onChange={handleCategoryChange}
            className="
              px-3 py-2 border border-gray-300 rounded-md
              text-sm bg-white text-gray-700
              cursor-pointer transition-colors duration-200
              hoover:boder-blue-500
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focu:border-transparent
            "
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="
        flex justify-between items-center mb-6 p-4
        bg-gray-50 rounded-lg border border-gray-200
      ">
        <p className="text-lg font-bold text-green-600">
          Total: ${filteredTotal.toFixed(2)} 
          <span className="text-sm text-gray-500">
            ({filteredExpenses.length} Expenses)
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {filteredExpenses.length === 0 ? (
          <p className="text-center text-gray-500 py-10 px-5">
            No expenses found. Add some expenses to get started!
          </p>
        ) : (
          filteredExpenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              {...expense}
              onDelete={onDeleteExpense}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;