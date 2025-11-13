'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, signOut } from '@/lib/auth';
import ExpenseForm from '@/app/components/ExpenseForm';
import FilterPanel from '@/app/components/FilterPanel';
import ExpenseList from '@/app/components/ExpenseList';
import Analytics from '@/app/components/Analytics';

// Filter state type
interface FilterState {
  startDate: string;
  endDate: string;
  categoryIds: string[];
  minAmount: string;
  maxAmount: string;
}

export default function DashboardPage() {
  const router = useRouter();
  
  // Filter state - shared across components
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    categoryIds: [],
    minAmount: '',
    maxAmount: '',
  });
  
  // Refresh trigger - increment to force expense list reload
  // This is a common pattern for refreshing data after mutations (create, update, delete)
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // View toggle - show expenses or analytics
  const [currentView, setCurrentView] = useState<'expenses' | 'analytics'>('expenses');

  // Check authentication on mount
  useEffect(() => {
    // If user is not authenticated, redirect to sign-in page
    if (!isAuthenticated()) {
      router.push('/signin');
    }
  }, [router]);

  // Handle filter changes from FilterPanel
  function handleFilterChange(newFilters: FilterState) {
    setFilters(newFilters);
    // Note: ExpenseList will automatically reload due to useEffect dependency on filters
  }

  // Handle expense creation from ExpenseForm
  function handleExpenseCreated() {
    // Increment trigger to force ExpenseList to reload
    // The actual value doesn't matter - only that it changed
    setRefreshTrigger((prev) => prev + 1);
  }

  // Handle expense deletion
  function handleDeleteExpense(id: string) {
    // After deletion is complete, refresh the list
    setRefreshTrigger((prev) => prev + 1);
  }

  // Handle sign out
  function handleSignOut() {
    signOut(); // Removes tokens and redirects to sign-in
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Tracker
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* View Toggle Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setCurrentView('expenses')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              currentView === 'expenses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setCurrentView('analytics')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              currentView === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Two-column layout on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Form and Filters (1/3 width on desktop) */}
          <div className="space-y-6">
            {/* Expense Form */}
            <ExpenseForm onExpenseCreated={handleExpenseCreated} />
            
            {/* Filter Panel */}
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>

          {/* Right Column: Main Content (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            {currentView === 'expenses' ? (
              <ExpenseList 
                filters={filters} 
                refreshTrigger={refreshTrigger}
                onDeleteExpense={handleDeleteExpense}
              />
            ) : (
              <Analytics filters={filters} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}