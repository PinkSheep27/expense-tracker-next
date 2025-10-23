'use client'

import React, { useState } from 'react';
import type { ExpenseCategory } from '@/components/ExpenseCard/ExpenseCard';

interface FormErrors{
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
}

// Form data interface
interface ExpenseFormData {
  description: string;
  amount: string;
  category: ExpenseCategory;
  date: string;
}

interface ExpenseFormProps {
  onSubmit: (expenseData: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
  }) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit }) => {
  // Form state using controlled components pattern
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0] // Today's date as default
  });

  /**
   * Handles input changes for all form fields using computed property names
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Change event from form inputs
   */

  const [errors, setErrors] = useState<FormErrors>({});

  const validateExpenseForm = (data: ExpenseFormData): { isValid: boolean; errors: FormErrors } => {
    const validationErrors: FormErrors = {};

    if (!data.description.trim()) {
      validationErrors.description = 'Description is required';
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      validationErrors.amount = 'Amount must be a positive number';
    }

    if (!data.category) {
      validationErrors.category = 'Category is required';
    }

    if (!data.date) {
      validationErrors.date = 'Date is required';
    }

    return {
      isValid: Object.keys(validationErrors).length === 0,
      errors: validationErrors
    };
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    const validation = validateExpenseForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({}); // Clear previous errors

    // Submit processed data
    onSubmit({
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date
    });

    // Reset form after successful submission
    setFormData({
      description: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <form className="
    bg-white p-6 rounded-lg shadow-sm mb-8
    border border-gray-200
    "
    onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold text-gray-900 mb-5">
        Add New Expense
        </h3>
      
      <div className="mb-4">
        <label 
        className="block text-sm font-medium text-gray-700 mb-1.5"
        htmlFor="description">
          Description *
          </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="What did you spend money on?"
          className={`
            w-full rounded-full border border-gray-300 px-3 py-2 text-sm
            transition-colors duration-200 text-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
            focus:border-transparent
            hover:border-blue-500
            ${errors.description ? 'border-red-500' : 'border-gray-300'}
            `}
        />
        {errors.description && <span className="
        ring-2 ring-red-500 ring-opacity-10
        text-red-500 text-xs mt-1
        ">{errors.description}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="mb-4">
          <label 
          className="block text-sm font-medium text-gray-700 mb-1.5" 
          htmlFor="amount">
            Amount *
            </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={`
              w-full rounded-full border border-gray-300 px-3 py-2 text-sm
              transition-colors duration-200 text-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-transparent
              hover:border-blue-500
              ${errors.amount ? 'border-red-500' : 'border-gray-300'}
              `}
          />
          {errors.amount && <span className="
          ring-2 ring-red-500 ring-opacity-10
          text-red-500 text-xs mt-1
          ">{errors.amount}</span>}
        </div>

        <div className="mb-4">
          <label 
          className="block text-sm font-medium text-gray-700 mb-1.5"
          htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`
              w-full rounded-full border border-gray-300 px-3 py-2 text-sm
              transition-colors duration-200 text-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-transparent
              hover:border-blue-500
            ${errors.category ? 'border-red-500' : 'border-gray-300'}
            `}
          >
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <span className="
          ring-2 ring-red-500 ring-opacity-10
          text-red-500 text-xs mt-1
          ">{errors.category}</span>}
        </div>
      </div>

      <div className="mb-4">
        <label 
        className="block text-sm font-medium text-gray-700 mb-1.5"
        htmlFor="date">
          Date
          </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className={`
              w-full rounded-full border border-gray-300 px-3 py-2 text-sm
              transition-colors duration-200 text-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-transparent
              hover:border-blue-500
            ${errors.date ? 'border-red-500' : 'border-gray-300'}
            `}
        />
        {errors.date && <span className="
          ring-2 ring-red-500 ring-opacity-10
          text-red-500 text-xs mt-1
          ">{errors.date}</span>}
      </div>

      <button type="submit" className="
        inline-flex items-center justify-center min-w-20
        px-4 py-2.5 rounded-md text-sm font-medium
        cursor-pointer border
        transition-all duration-200
        bg-blue-500 text-white border-blue-500
        hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        disabled:hover:transform-none
      ">
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;