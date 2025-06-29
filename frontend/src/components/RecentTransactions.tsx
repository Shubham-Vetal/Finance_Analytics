import React, { useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '@/context/ThemeContext';

interface RecentTransactionsProps {
  onSeeAllClick: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onSeeAllClick }) => {
  const { transactions, fetchTransactions } = useTransactions();
  const { theme } = useTheme();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // REFINED getAvatarContent function
  const getAvatarContent = (description?: string, category?: string): string => {
    // Prioritize description, then category, otherwise an empty string
    const textToUse = description || category || '';
    // Remove leading/trailing spaces and multiple internal spaces
    const cleanedText = textToUse.trim().replace(/\s+/g, ' ');

    if (!cleanedText) {
      return 'T'; // Default to 'T' for Transaction if no meaningful text
    }

    const words = cleanedText.split(' ').filter(word => word.length > 0);

    if (words.length >= 2) {
      // Take the first letter of the first two words
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1) {
      // Take the first letter of the single word
      return words[0][0].toUpperCase();
    }
    return 'T'; // Fallback if no valid words are extracted after cleaning
  };

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3); // Get only the top 3 most recent transactions

  return (
    <div className={`rounded-xl p-6 ${
      theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Recent Transactions</h3>
        <button
          onClick={onSeeAllClick}
          className={`text-sm font-medium transition-colors ${
            theme === 'dark' ? 'text-green-500 hover:text-green-400' : 'text-green-600 hover:text-green-700'
          }`}
        >
          See all
        </button>
      </div>

      <div className="space-y-4">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                {getAvatarContent(transaction.description, transaction.category)}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{transaction.description || 'N/A'}</p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {transaction.type === 'income' ? 'Income' : 'Expense'} - {transaction.category}
                </p>
              </div>
              <span
                className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-500' : 'text-red-400'
                }`}
              >
                {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
              </span>
            </div>
          ))
        ) : (
          <p className={`text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>No recent transactions.</p>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;