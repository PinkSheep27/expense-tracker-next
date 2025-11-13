'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, signOut, authenticatedFetch } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/signin');
      return;
    }
    loadExpenses();
  }, [router]);

  async function loadExpenses() {
    try {
      const response = await authenticatedFetch('/api/expenses');
      
      if (!response.ok) {
        console.error('Failed to fetch expenses');
        signOut();
        return;
      }
      
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    signOut();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Expense Tracker
          </h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Your Expenses</h2>
        
        {expenses.length === 0 ? (
          <p className="text-gray-600">No expenses yet. Start tracking!</p>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {expenses.map((expense: any) => (
              <div
                key={expense.id}
                className="p-4 border-b last:border-b-0 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{expense.category}</p>
                  <p className="text-sm text-gray-600">{expense.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-lg font-bold text-green-600">
                  ${expense.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
