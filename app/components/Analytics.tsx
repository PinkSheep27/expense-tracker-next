'use client';

import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/auth';

// Props from parent
interface AnalyticsProps {
  filters: any;  // Date filters to apply to analytics
}

export default function Analytics({ filters }: AnalyticsProps) {
  // Analytics data
  const [analytics, setAnalytics] = useState<any>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load analytics when filters change
  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  // Fetch analytics from API
  async function loadAnalytics() {
    setLoading(true);
    setError('');

    try {
      // Build query string with date filters
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await authenticatedFetch(`/api/expenses/analytics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
      
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  // Format currency
  function formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  if (loading) {
    return <div className="text-center py-6 text-gray-600">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-600">{error}</div>;
  }

  if (!analytics || analytics.overall.count === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-6 text-gray-600">
          No data available for the selected period.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Spending Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total Spending</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analytics.overall.total)}
          </p>
        </div>

        {/* Average Expense Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Average Expense</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analytics.overall.average)}
          </p>
        </div>

        {/* Number of Expenses Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.overall.count}
          </p>
        </div>

        {/* Highest Expense Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Highest Expense</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analytics.overall.highest)}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Spending by Category</h3>
        
        <div className="space-y-4">
          {/* Map over category breakdown */}
          {analytics.byCategory.map((cat: any) => (
            <div key={cat.categoryId}>
              {/* Category Header */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{cat.categoryIcon}</span>
                  <span className="font-semibold">{cat.categoryName}</span>
                  <span className="text-sm text-gray-500">
                    ({cat.count} {cat.count === 1 ? 'expense' : 'expenses'})
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(cat.total)}</p>
                  <p className="text-sm text-gray-600">{cat.percentage}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.categoryColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}