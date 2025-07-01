import React, { useState, useMemo, useEffect } from 'react';
import { BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, ChevronDown } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useTransactions, Transaction, SummaryItem, CategoryBreakdownItem } from '../context/TransactionContext';
import { useTheme } from '@/context/ThemeContext'; 

// Colors for the charts (these are generally fine as fixed colors that stand out)
const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280']; // Green, Yellow, Red, Blue, Purple, Pink, Gray

interface AnalyticsProps {
  searchTerm: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ searchTerm }) => {
  const { transactions, getBreakdown, getSummary } = useTransactions();
  const { theme } = useTheme(); //

  const [activeChartTab, setActiveChartTab] = useState('trend'); // 'trend', 'category', 'status'
  const [trendPeriod, setTrendPeriod] = useState('monthly'); // 'monthly', 'quarterly', 'annually'
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all'); // Default to 'all' years
  const [loading, setLoading] = useState(true); // Initial loading state

  // --- Data Aggregation Helper Functions ---

  const getYearsFromTransactions = (txs: Transaction[]) => {
    if (txs.length === 0) return []; // Return empty array if no transactions
    const years = new Set<number>();
    txs.forEach(tx => years.add(new Date(tx.createdAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  };

  const currentAvailableYears = useMemo(() => getYearsFromTransactions(transactions), [transactions]);

  // Update selectedYear default if transactions change and 'all' is not selected
  useEffect(() => {
    if (selectedYear === 'all' && currentAvailableYears.length > 0) {
      // Optionally set to the most recent year if 'all' is chosen and data becomes available
      // setSelectedYear(currentAvailableYears[0]); // Decided against auto-setting to year for better user control
    } else if (selectedYear !== 'all' && !currentAvailableYears.includes(selectedYear as number)) {
      // If the currently selected year is no longer available, default to 'all'
      setSelectedYear('all');
    }
  }, [currentAvailableYears, selectedYear]);


  // Aggregate data for the trend chart (income/expense over time)
  const aggregatedTrendData = useMemo(() => {
    let data: { periodLabel: string; income: number; expense: number }[] = [];
    const filteredTransactions = selectedYear === 'all'
      ? transactions
      : transactions.filter(tx => new Date(tx.createdAt).getFullYear() === selectedYear);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

    if (trendPeriod === 'monthly') {
      const monthlyMap: { [key: string]: { income: number; expense: number } } = {};
      // Initialize monthly data for all months for consistent chart display
      monthNames.forEach(month => monthlyMap[month] = { income: 0, expense: 0 });

      filteredTransactions.forEach(tx => {
        const month = monthNames[new Date(tx.createdAt).getMonth()];
        if (monthlyMap[month]) {
          if (tx.type === 'income') monthlyMap[month].income += tx.amount;
          else monthlyMap[month].expense += tx.amount;
        }
      });
      data = monthNames.map(month => ({ periodLabel: month, ...monthlyMap[month] }));

    } else if (trendPeriod === 'quarterly') {
      const quarterlyMap: { [key: string]: { income: number; expense: number } } = {};
      quarterNames.forEach(q => quarterlyMap[q] = { income: 0, expense: 0 });

      filteredTransactions.forEach(tx => {
        const month = new Date(tx.createdAt).getMonth();
        const quarter = quarterNames[Math.floor(month / 3)];
        if (quarterlyMap[quarter]) {
          if (tx.type === 'income') quarterlyMap[quarter].income += tx.amount;
          else quarterlyMap[quarter].expense += tx.amount;
        }
      });
      data = quarterNames.map(q => ({ periodLabel: q, ...quarterlyMap[q] }));

    } else if (trendPeriod === 'annually') {
      const yearlyMap: { [key: string]: { income: number; expense: number } } = {};

      // Initialize with all available years from all transactions to ensure all years are represented
      getYearsFromTransactions(transactions).sort((a, b) => a - b).forEach(year => {
        yearlyMap[year.toString()] = { income: 0, expense: 0 };
      });

      filteredTransactions.forEach(tx => {
        const year = new Date(tx.createdAt).getFullYear().toString();
        if (!yearlyMap[year]) yearlyMap[year] = { income: 0, expense: 0 }; // Fallback, though init should cover
        if (tx.type === 'income') yearlyMap[year].income += tx.amount;
        else yearlyMap[year].expense += tx.amount;
      });
      data = Object.keys(yearlyMap).sort((a, b) => parseInt(a) - parseInt(b)).map(year => ({ periodLabel: year, ...yearlyMap[year] }));
    }
    console.log("Aggregated Trend Data:", data); // Debugging
    return data;
  }, [transactions, trendPeriod, selectedYear]);

  // Max Y value for trend chart
  const maxTrendYValue = useMemo(() => {
    let max = 0;
    aggregatedTrendData.forEach(d => {
      max = Math.max(max, d.income, d.expense);
    });
    return Math.max(max, 100); // Ensure a minimum scale for small values
  }, [aggregatedTrendData]);


  // Aggregate data for category breakdown (expenses)
  const expenseBreakdownData = useMemo(() => {
    const breakdownMap: { [key: string]: number } = {};
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        breakdownMap[tx.category] = (breakdownMap[tx.category] || 0) + tx.amount;
      });
    const result = Object.keys(breakdownMap).map(category => ({
      name: category,
      value: breakdownMap[category],
    })).sort((a, b) => b.value - a.value);
    // console.log("Expense Breakdown Data:", result); // Debugging
    return result;
  }, [transactions]);

  // Aggregate data for transaction status
  const statusBreakdownData = useMemo(() => {
    const statusMap: { [key: string]: number } = {};
    transactions.forEach(tx => {
      statusMap[tx.status] = (statusMap[tx.status] || 0) + 1; // Count transactions per status
    });
    const result = Object.keys(statusMap).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusMap[status],
    }));
    // console.log("Status Breakdown Data:", result); // Debugging
    return result;
  }, [transactions]);

  // Effect to manage loading state based on transactions data
  useEffect(() => {
    if (transactions !== null) {
      setLoading(false);
    }
    // console.log("Transactions array updated:", transactions); // Debugging
  }, [transactions]);

  const renderLoadingState = () => (
    <div className={`flex items-center justify-center h-full ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }`}>
      Loading analytics data...
    </div>
  );

  const renderNoDataState = () => (
    <div className={`flex items-center justify-center h-full ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }`}>
      No data available for the selected criteria.
    </div>
  );

  return (
    <div className={`rounded-xl p-6 h-full flex flex-col ${
      theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      <h3 className={`text-xl font-semibold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Financial Analytics</h3>

      {/* Chart Type Tabs */}
      <div className={`flex space-x-4 mb-6 pb-4 ${
        theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'
      }`}>
        <button
          onClick={() => setActiveChartTab('trend')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
            activeChartTab === 'trend'
              ? 'bg-green-600 text-white shadow-md'
              : theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <LineChartIcon size={18} />
          <span>Income/Expense Trend</span>
        </button>
        <button
          onClick={() => setActiveChartTab('category')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
            activeChartTab === 'category'
              ? 'bg-green-600 text-white shadow-md'
              : theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <PieChartIcon size={18} />
          <span>Expense Categories</span>
        </button>
        <button
          onClick={() => setActiveChartTab('status')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
            activeChartTab === 'status'
              ? 'bg-green-600 text-white shadow-md'
              : theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BarChart2 size={18} />
          <span>Transaction Status</span>
        </button>
      </div>

      {loading ? renderLoadingState() : (
        <>
          {/* Trend Chart Options */}
          {activeChartTab === 'trend' && (
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <select
                  value={trendPeriod}
                  onChange={(e) => setTrendPeriod(e.target.value as 'monthly' | 'quarterly' | 'annually')}
                  className={`px-4 py-2 rounded-lg pr-8 appearance-none cursor-pointer ${
                    theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
                <ChevronDown size={16} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              {/* Only show year selector if not in 'annually' mode and there are available years */}
              {trendPeriod !== 'annually' && currentAvailableYears.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className={`px-4 py-2 rounded-lg pr-8 appearance-none cursor-pointer ${
                      theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    <option value="all">All Years</option>
                    {currentAvailableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                </div>
              )}
            </div>
          )}

          {/* Chart Display Area */}
          <div className={`flex-1 min-h-[300px] rounded-lg p-4 flex items-center justify-center relative ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            {activeChartTab === 'trend' && (
              aggregatedTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={aggregatedTrendData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4B5563' : '#D1D5DB'} />
                    <XAxis dataKey="periodLabel" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} domain={[0, maxTrendYValue]} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #D1D5DB',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: theme === 'dark' ? '#E5E7EB' : '#1F2937' }}
                      itemStyle={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}
                      formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]}
                    />
                    <Legend wrapperStyle={{ color: theme === 'dark' ? '#E5E7EB' : '#374151', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="expense" stroke="#F59E0B" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : renderNoDataState()
            )}

            {activeChartTab === 'category' && (
              expenseBreakdownData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8" // This fill is overridden by Cell fill
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #D1D5DB',
                        borderRadius: '8px'
                      }}
                      itemStyle={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend wrapperStyle={{ color: theme === 'dark' ? '#E5E7EB' : '#374151', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : renderNoDataState()
            )}

            {activeChartTab === 'status' && (
              statusBreakdownData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusBreakdownData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4B5563' : '#D1D5DB'} />
                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #D1D5DB',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: theme === 'dark' ? '#E5E7EB' : '#1F2937' }}
                      itemStyle={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}
                      formatter={(value: number) => [`${value.toLocaleString()}`, 'Transactions']}
                    />
                    <Legend wrapperStyle={{ color: theme === 'dark' ? '#E5E7EB' : '#374151', paddingTop: '10px' }} />
                    <Bar dataKey="value">
                      {statusBreakdownData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : renderNoDataState()
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;