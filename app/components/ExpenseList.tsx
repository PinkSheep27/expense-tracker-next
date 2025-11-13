'use client'

import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/auth';
import ExpenseCard from '@/app/components/ExpenseCard';
import type { ExpenseCategory } from '@/app/components/ExpenseCard';

// NEW: Props from parent
interface ExpenseListProps {
  filters: FilterState;         // Current filters applied
  refreshTrigger: number;       // Changes when we need to refresh
  onDeleteExpense?: (id: string) => void;  // Optional delete handler
}

// NEW: Filter state type
interface FilterState {
  startDate: string;
  endDate: string;
  categoryIds: string[];
  minAmount: string;
  maxAmount: string;
}

// NEW: Expense type from API (includes category object)
interface Expense {
  id: string;
  userId: string;
  amount: string;
  description: string;
  date: string;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

const ExpenseList: React.FC<ExpenseListProps> = ({ 
  filters, 
  refreshTrigger,
  onDeleteExpense 
}) => {
  // Expenses data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // NEW: Load expenses when filters, page, or refreshTrigger changes
  useEffect(() => {
    loadExpenses();
  }, [currentPage, filters, refreshTrigger]);

  // NEW: Fetch expenses from API
  async function loadExpenses() {
    setLoading(true);
    setError('');

    try {
      // Build query string with filters and pagination
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '20',
      });

      // Add filters if they exist
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.categoryIds?.length > 0) {
        params.append('categoryIds', filters.categoryIds.join(','));
      }
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

      // Make API request with authentication
      const response = await authenticatedFetch(`/api/expenses?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      
      // Update state with response
      setExpenses(data.expenses || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
      
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Pagination handlers
  function goToPreviousPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Format amount for display
  function formatAmount(amount: string): string {
    return parseFloat(amount).toFixed(2);
  }

  // Calculate filtered total
  const filteredTotal = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading expenses...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-red-600">{error}</div>
        <button
          onClick={loadExpenses}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12 text-gray-600">
          {filters.startDate || filters.endDate || filters.categoryIds?.length > 0 || filters.minAmount || filters.maxAmount
            ? 'No expenses found matching your filters. Try adjusting your filters.'
            : 'No expenses yet. Add your first expense to get started!'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with total */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            Your Expenses
            <span className="text-gray-500 font-normal ml-2">
              ({totalCount} total)
            </span>
          </h2>
          
          <div className="flex items-center gap-3">
            <p className="text-gray-700 font-medium">
              Filtered Total: 
              <span className="text-lg font-bold text-green-600 ml-2">
                ${filteredTotal.toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              ({expenses.length} on this page)
            </p>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="divide-y divide-gray-200">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            {/* Use your existing ExpenseCard component */}
            <ExpenseCard
              id={expense.id}
              description={expense.description}
              amount={parseFloat(expense.amount)}
              category={expense.category.name as ExpenseCategory}
              date={expense.date}
              receiptUrl={expense.receiptUrl || undefined}
              onDelete={onDeleteExpense}
              highlighted={parseFloat(expense.amount) > 50}
            />
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          {/* Previous Button */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {/* Page Info */}
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          {/* Next Button */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;