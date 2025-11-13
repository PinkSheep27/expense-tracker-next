'use client'

import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/auth';  // NEW IMPORT

interface FormErrors {
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
  receipt?: string
}

interface ExpenseFormData {
  description: string;
  amount: string;
  categoryId: string;  // CHANGED: from category to categoryId
  date: string;
}

interface ExpenseFormProps {
  onExpenseCreated: () => void;  // CHANGED: simpler callback
}

// NEW: Category type from API
interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onExpenseCreated }) => {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // NEW: Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    categoryId: '',  // CHANGED: will be set after categories load
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // NEW: Load categories when component mounts
  useEffect(() => {
    loadCategories();
  }, []);

  // NEW: Fetch categories from API
  async function loadCategories() {
    try {
      setLoadingCategories(true);
      const response = await authenticatedFetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to load categories');
      }
      
      const data = await response.json();
      setCategories(data.categories || []);
      
      // Set first category as default
      if (data.categories && data.categories.length > 0) {
        setFormData(prev => ({
          ...prev,
          categoryId: data.categories[0].id
        }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setErrors(prev => ({ 
        ...prev, 
        category: 'Failed to load categories. Please refresh the page.' 
      }));
    } finally {
      setLoadingCategories(false);
    }
  }

  const validateExpenseForm = (data: ExpenseFormData): {isValid: boolean; errors: FormErrors} => {
    const validationErrors: FormErrors = {};

    if (!data.description.trim()) {
      validationErrors.description = 'Description is required';
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      validationErrors.amount = 'Amount must be a positive number';
    }

    // CHANGED: Validate categoryId instead of category
    if (!data.categoryId) {
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

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // UNCHANGED - keep your existing receipt validation logic
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ 
          ...prev, 
          receipt: 'Please select an image file (JPG, PNG, GIF)' 
        }));
        setReceipt(null);
        return;
      }
      
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        setErrors(prev => ({ 
          ...prev, 
          receipt: 'File size must be less than 5MB' 
        }));
        setReceipt(null);
        return;
      }
      
      setReceipt(file);
      setErrors(prev => ({ ...prev, receipt: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validate form
    const validation = validateExpenseForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setUploading(true);

    try {
      let receiptUrl: string | undefined;

      // Upload receipt if selected (UNCHANGED)
      if (receipt) {
        const receiptFormData = new FormData();
        receiptFormData.append('receipt', receipt);

        const uploadResponse = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: receiptFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload receipt');
        }

        const uploadData = await uploadResponse.json();
        receiptUrl = uploadData.url;
      }

      // CHANGED: Submit to /api/expenses with categoryId
      const expenseResponse = await authenticatedFetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId,  // CHANGED: send categoryId
          description: formData.description.trim(),
          date: formData.date,
          receiptUrl,
        }),
      });

      if (!expenseResponse.ok) {
        const errorData = await expenseResponse.json();
        throw new Error(errorData.error || 'Failed to create expense');
      }

      // CHANGED: Call onExpenseCreated callback instead of onSubmit
      onExpenseCreated();

      // Reset form
      setFormData({
        description: '',
        amount: '',
        categoryId: categories[0]?.id || '',  // CHANGED: reset to first category
        date: new Date().toISOString().split('T')[0]
      });
      
      setReceipt(null);
      
      const fileInput = document.getElementById('receipt-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ 
        receipt: error instanceof Error 
          ? error.message
          : 'Failed to create expense' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-gray-900 mb-5">Add New Expense</h3>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
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
            w-full px-3 py-2.5 
            border rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-gray-400 text-sm bg-white
            transition-colors duration-200
            ${errors.description 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
            }
          `}
        />
        {errors.description && (
          <span className="text-red-500 text-xs mt-1 block">{errors.description}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1.5">
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
              w-full px-3 py-2.5 
              border rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder-gray-400 text-sm bg-white
              transition-colors duration-200
              ${errors.amount 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
              }
            `}
          />
          {errors.amount && (
            <span className="text-red-500 text-xs mt-1 block">{errors.amount}</span>
          )}
        </div>

        {/* CHANGED: Category dropdown now uses API data */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1.5">
            Category *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            disabled={loadingCategories}
            className={`
              w-full px-3 py-2.5 
              border rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              text-sm bg-white cursor-pointer
              transition-colors duration-200
              ${errors.category 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
              }
              ${loadingCategories ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loadingCategories ? (
              <option>Loading categories...</option>
            ) : categories.length === 0 ? (
              <option>No categories available</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))
            )}
          </select>
          {errors.category && (
            <span className="text-red-500 text-xs mt-1 block">{errors.category}</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">
          Date *
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className={`
            w-full px-3 py-2.5 
            border rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            text-sm bg-white
            transition-colors duration-200
            ${errors.date 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
            }
          `}
        />
        {errors.date && (
          <span className="text-red-500 text-xs mt-1 block">{errors.date}</span>
        )}
      </div>

      {/* Receipt upload - UNCHANGED */}
      <div className="mb-6">
        <label htmlFor="receipt-input" className="block text-sm font-medium text-gray-700 mb-1.5">
          Receipt (Optional)
        </label>
        <input
          type="file"
          id="receipt-input"
          accept="image/*"
          onChange={handleReceiptChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
        />
        {receipt && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: <span className="font-medium">{receipt.name}</span>
            {' '}({(receipt.size / 1024).toFixed(2)} KB)
          </p>
        )}
        {errors.receipt && (
          <span className="text-red-500 text-xs mt-1 block">{errors.receipt}</span>
        )}
        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
      </div>

      <button 
        type="submit" 
        disabled={uploading || loadingCategories}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          uploading || loadingCategories
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {uploading ? 'Uploading Receipt...' : loadingCategories ? 'Loading...' : 'Add Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;