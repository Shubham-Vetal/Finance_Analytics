import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useTransactions, Transaction } from '../context/TransactionContext';
import { useMessages } from '@/context/MessageContext';
import { useTheme } from '@/context/ThemeContext';

const predefinedCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Other'];

const TransactionsTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCategoryOption, setSelectedCategoryOption] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { addMessage } = useMessages();
  const { theme } = useTheme();

  // New states for deletion confirmation modal
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);

  // Filter states
  const [filterOption, setFilterOption] = useState<'none' | 'type' | 'date-newest' | 'date-oldest' | 'custom-date'>('none');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredAndSortedTransactions = useMemo(() => {
    let tempTransactions = transactions.filter((transaction) => {
      // Ensure description is treated as string for includes
      const txDescription = transaction.description || '';
      const txCategory = transaction.category || '';
      const txStatus = transaction.status || '';

      const matchesSearch =
        txDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.amount.toString().includes(searchTerm);

      let matchesFilterOption = true;

      if (filterOption === 'type') {
        matchesFilterOption = filterType === 'all' || transaction.type === filterType;
      } else if (filterOption === 'custom-date') {
        // Parse dates safely
        const transactionDate = transaction.createdAt ? new Date(transaction.createdAt) : null;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        matchesFilterOption = true;
        if (transactionDate) {
            if (start && transactionDate < start) matchesFilterOption = false;
            if (end && transactionDate > end) matchesFilterOption = false;
        } else {
            // If transaction has no date, it won't match any date range filter
            if (start || end) matchesFilterOption = false;
        }
      }

      return matchesSearch && matchesFilterOption;
    });

    // Default sort: always show newest first unless another date filter is explicitly chosen
    if (filterOption === 'date-oldest') {
      tempTransactions.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
    } else if (filterOption === 'none' || filterOption === 'type' || filterOption === 'custom-date' || filterOption === 'date-newest') {
      // For 'none', 'type', 'custom-date' or 'date-newest', sort by newest by default
      tempTransactions.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return tempTransactions;
  }, [transactions, searchTerm, filterOption, filterType, startDate, endDate]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check for invalid date before formatting
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date'; // Catch any other parsing errors
    }
  };

  // REFINED getAvatarContent function
  const getAvatarContent = (description?: string, category?: string): string => {
    const textToUse = description || category || ''; // Use description first, then category, else empty string
    const cleanedText = textToUse.trim(); // Remove leading/trailing spaces

    if (!cleanedText) {
      return 'T'; // Default to 'T' for Transaction if no meaningful text
    }

    const words = cleanedText.split(' ').filter(word => word.length > 0); // Split and filter out empty strings from multiple spaces

    if (words.length >= 2) {
      // Take the first letter of the first two words
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1) {
      // Take the first letter of the single word
      return words[0][0].toUpperCase();
    }
    return 'T'; // Fallback if no valid words are extracted
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const selectedCat = formData.get('category') as string;
    const category = selectedCat === 'custom' ? customCategory : selectedCat;

    const data = {
      description: formData.get('description') as string,
      category,
      amount: parseFloat(formData.get('amount') as string),
      type: formData.get('type') as 'income' | 'expense',
      status: formData.get('status') as 'completed' | 'pending' | 'failed',
    };

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, data);
        addMessage({ content: 'Transaction updated successfully!', type: 'success' });
      } else {
        await addTransaction(data);
        addMessage({ content: 'Transaction added successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Transaction submission error:', error);
      addMessage({ content: `Failed to ${editingTransaction ? 'update' : 'add'} transaction.`, type: 'error' });
    } finally {
      setShowModal(false);
      setEditingTransaction(null);
      setCustomCategory('');
      setSelectedCategoryOption('');
      form.reset();
    }
  };

  // Function to initiate deletion confirmation modal
  const handleDeleteClick = (transactionId: string) => {
    setTransactionToDeleteId(transactionId);
    setShowConfirmDeleteModal(true);
    setSelectedTransaction(null); // Close the details modal immediately
  };

  // Function to perform deletion after confirmation
  const handleConfirmDelete = async () => {
    if (transactionToDeleteId) {
      try {
        await deleteTransaction(transactionToDeleteId);
        addMessage({ content: 'Transaction deleted successfully!', type: 'success' });
      } catch (error) {
        console.error('Deletion error:', error);
        addMessage({ content: 'Failed to delete transaction.', type: 'error' });
      }
    }
    setShowConfirmDeleteModal(false);
    setTransactionToDeleteId(null);
  };


  return (
    <div className={`rounded-xl p-6 ${
      theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      {/* Sticky Filter Section */}
      <div className={`sticky top-0 z-20 pb-4 border-b ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 md:gap-0">
          <h3 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Transactions</h3>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} size={16} />
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              />
            </div>

            <div className="relative w-full md:w-auto">
              <select
                value={filterOption}
                onChange={(e) => {
                  setFilterOption(e.target.value as typeof filterOption);
                  if (e.target.value !== 'custom-date') {
                    setStartDate('');
                    setEndDate('');
                  }
                  if (e.target.value !== 'type') {
                    setFilterType('all');
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors w-full md:w-auto justify-center appearance-none cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                style={{ paddingRight: '2.5rem' }}
              >
                <option value="none">Filter by...</option>
                <option value="type">By Types</option>
                <option value="date-newest">By Date (Newest)</option>
                <option value="date-oldest">By Date (Oldest)</option>
                <option value="custom-date">By Custom Date Range</option>
              </select>
              <Filter className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} size={16} />
            </div>

            {(filterOption === 'type') && (
              <div className="relative w-full md:w-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                  className={`p-2 rounded border w-full ${
                    theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            )}

            {(filterOption === 'custom-date') && (
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`p-2 rounded border w-full ${
                    theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`p-2 rounded border w-full ${
                    theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setShowModal(true);
            setSelectedCategoryOption('');
            setCustomCategory('');
          }}
          className="mb-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          + Add Transaction
        </button>
      </div>

      {/* Add/Edit Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-full max-w-md border space-y-4 ${
            theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'
          }`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingTransaction(null); setCustomCategory(''); setSelectedCategoryOption(''); }}>
                <X className={`${theme === 'dark' ? 'text-white hover:text-gray-400' : 'text-gray-600 hover:text-gray-800'}`} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="description"
                placeholder="Description"
                defaultValue={editingTransaction?.description || ''}
                required
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              />
              <select
                name="category"
                value={selectedCategoryOption || (editingTransaction && !predefinedCategories.includes(editingTransaction.category) ? 'custom' : editingTransaction?.category || '')}
                onChange={(e) => {
                  setSelectedCategoryOption(e.target.value);
                  if (e.target.value === 'custom' && editingTransaction && !predefinedCategories.includes(editingTransaction.category)) {
                    setCustomCategory(editingTransaction.category);
                  } else {
                    setCustomCategory('');
                  }
                }}
                required
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {predefinedCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">Other (Custom)</option>
              </select>
              {(selectedCategoryOption === 'custom' || (!predefinedCategories.includes(editingTransaction?.category || '') && editingTransaction && selectedCategoryOption === '')) && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                  className={`w-full p-2 rounded border ${
                    theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                />
              )}
              <input
                name="amount"
                type="number"
                placeholder="Amount"
                defaultValue={editingTransaction?.amount || ''}
                required
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              />
              <select
                name="type"
                defaultValue={editingTransaction?.type || 'expense'}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <select
                name="status"
                defaultValue={editingTransaction?.status || 'pending'}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <div className="flex justify-end gap-2">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editingTransaction ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full relative ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white border border-gray-300'
          }`}>
            <button
              className={`absolute top-4 right-4 hover:text-gray-400 ${
                theme === 'dark' ? 'text-white' : 'text-gray-600'
              }`}
              onClick={() => setSelectedTransaction(null)}
            >
              <X size={20} />
            </button>
            <h2 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Transaction Details</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}><strong>Description:</strong> {selectedTransaction.description || 'N/A'}</p>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}><strong>Category:</strong> {selectedTransaction.category}</p>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}><strong>Amount:</strong> ₹{selectedTransaction.amount.toFixed(2)}</p>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}><strong>Type:</strong> {selectedTransaction.type}</p>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}><strong>Status:</strong> {selectedTransaction.status}</p>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}><strong>Date:</strong> {formatDate(selectedTransaction.createdAt)}</p>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => {
                  setEditingTransaction(selectedTransaction);
                  setShowModal(true);
                  setSelectedTransaction(null);
                  if (!predefinedCategories.includes(selectedTransaction.category)) {
                    setSelectedCategoryOption('custom');
                    setCustomCategory(selectedTransaction.category);
                  } else {
                    setSelectedCategoryOption(selectedTransaction.category);
                    setCustomCategory('');
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(selectedTransaction._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-full max-w-sm border space-y-4 ${
            theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'
          }`}>
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Confirm Deletion</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowConfirmDeleteModal(false); setTransactionToDeleteId(null); }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Table Container */}
      <div className="overflow-y-auto max-h-[290px]">
        <table className={`min-w-full divide-y ${
          theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
        }`}>
          <thead className={`sticky top-0 z-10 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <tr className={`border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <th className={`text-left font-medium py-3 px-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Description / Category</th>
              <th className={`text-left font-medium py-3 px-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Date</th>
              <th className={`text-left font-medium py-3 px-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Amount</th>
              <th className={`text-left font-medium py-3 px-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTransactions.length > 0 ? (
              filteredAndSortedTransactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className={`border-b transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                        {getAvatarContent(transaction.description, transaction.category)}
                      </div>
                      <div>
                        <span className={`font-medium block ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{transaction.description || 'N/A'}</span>
                        <span className={`text-sm block ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>{transaction.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className={`py-4 px-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{formatDate(transaction.createdAt)}</td>
                  <td className="py-4 px-4">
                    <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-400'}`}>
                      {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={`py-8 text-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;