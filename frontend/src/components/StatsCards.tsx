import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useTransactions } from '@/context/TransactionContext';
import { useTheme } from '@/context/ThemeContext';

interface StatsCardsProps {
  searchTerm: string;
}

const StatsCards: React.FC<StatsCardsProps> = ({ searchTerm }) => {
  const { getSummary } = useTransactions();
  const { theme } = useTheme();
  const [summaryData, setSummaryData] = useState({ income: 0, expense: 0 });

 useEffect(() => {
  const fetchSummary = async () => {
    try {
      const data = await getSummary(); // <--- This line is key
      const income = data.find((item) => item._id === 'income')?.total || 0;
      const expense = data.find((item) => item._id === 'expense')?.total || 0;
      setSummaryData({ income, expense });
    } catch (err) {
      console.error('Failed to load summary stats:', err);
    }
  };
  fetchSummary();
}, [getSummary]);

  const balance = summaryData.income - summaryData.expense;
  const savings = balance; // or use your own savings logic

  const stats = [
    {
      title: 'Balance',
      amount: `₹${balance.toLocaleString()}`,
      icon: Wallet,
      color: 'from-green-400 to-green-600',
    },
    {
      title: 'Revenue',
      amount: `₹${summaryData.income.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Expenses',
      amount: `₹${summaryData.expense.toLocaleString()}`,
      icon: TrendingDown,
      color: 'from-red-400 to-red-600',
    },
    {
      title: 'Savings',
      amount: `₹${savings.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-400 to-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`rounded-xl p-6 transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-800 border border-gray-700 hover:border-gray-600 hover:shadow-lg hover:shadow-green-500/10'
                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <Icon className="text-white" size={24} />
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{stat.title}</p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{stat.amount}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;