'use client';

import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/auth';

// Props = data parent passes to this component
interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;  // Callback when filters change
}

// Type definition for filter state
interface FilterState {
  startDate: string;
  endDate: string;
  categoryIds: string[];
  minAmount: string;
  maxAmount: string;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  
  // Categories list
  const [categories, setCategories] = useState<any[]>([]);

  // Load categories when component mounts
  useEffect(() => {
    loadCategories();
  }, []);

  // Fetch categories from API
  async function loadCategories() {
    try {
      const response = await authenticatedFetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  // Apply filters
  function applyFilters() {
    // Build filter object
    const filters: FilterState = {
      startDate,
      endDate,
      categoryIds: selectedCategories,
      minAmount,
      maxAmount,
    };
    
    // Call parent's callback with filters
    onFilterChange(filters);
  }

  // Clear all filters
  function clearFilters() {
    setStartDate('');
    setEndDate('');
    setSelectedCategories([]);
    setMinAmount('');
    setMaxAmount('');
    
    // Notify parent that filters are cleared
    onFilterChange({
      startDate: '',
      endDate: '',
      categoryIds: [],
      minAmount: '',
      maxAmount: '',
    });
  }

  // Set quick date ranges
  function setDateRange(range: string) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    switch (range) {
      case 'thisMonth':
        // First day of current month
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
        
      case 'lastMonth':
        // First day of last month
        const lastMonthFirst = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        // Last day of last month (day 0 of current month)
        const lastMonthLast = new Date(today.getFullYear(), today.getMonth(), 0);
        setStartDate(lastMonthFirst.toISOString().split('T')[0]);
        setEndDate(lastMonthLast.toISOString().split('T')[0]);
        break;
        
      case 'last30Days':
        // 30 days ago
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
    }
  }

  // Toggle category selection
  function toggleCategory(categoryId: string) {
    setSelectedCategories((prev) => {
      // If already selected, remove it
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      // Otherwise, add it
      return [...prev, categoryId];
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      {/* Quick Date Range Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Date Range
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDateRange('thisMonth')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('lastMonth')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Last Month
          </button>
          <button
            onClick={() => setDateRange('last30Days')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Category Checkboxes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {/* Map over categories to create checkboxes */}
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="rounded border-gray-300"
              />
              <span className="flex items-center space-x-2">
                <span>{cat.icon}</span>
                <span className="text-sm">{cat.name}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Min Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="0.00"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="0.00"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={applyFilters}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
}