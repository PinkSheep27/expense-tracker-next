import React from 'react';

interface ExpenseSummaryProps {
  totalAmount: number;
  expenseCount: number;
  period?: string;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ 
  totalAmount,
  expenseCount,
  period = "All Time" 
}) => {
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(totalAmount);

  return (
    <section className="
    bg-white rounded-lg p-4 md:p-6 mb-5 md:mb-8 shadow-sm
    border border-gray-200
    ">
      <div className="
      flex flex-col md:flex-row md:justify-between md:items-center 
      mb-5 pb-4 border-b border-gray-200
      gap-3 md:gap-8 text-center md:text-left
      ">
        <h2 className="
          text-xl md:text-2xl font-bold 
          text-gray-900 mb-2 sm:mb-0
        ">
          Expense Summary
        </h2>
        <span className="
          bg-gray-100 text-gray-500 px-3 py-1.5 
          rounded-full text-sm font-medium
        ">
          {period}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
        <div className="flex flex-col items-center text-center">
          <span className="
          text-sm font-medium text-gray-500 mb-2
          ">
            Total Spent
          </span>
          <span className="
          text-xl sm:text-2xl md:text-3xl font-bold text-gray-900
          ">
            {formattedTotal}
          </span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="
          text-sm font-medium text-gray-500 mb-2
          ">
            Expenses
          </span>
          <span className="
          text-xl sm:text-2xl md:text-3xl font-bold text-gray-900
          ">
            {expenseCount}
          </span>
        </div>
      </div>
    </section>
  );
};

export default ExpenseSummary;