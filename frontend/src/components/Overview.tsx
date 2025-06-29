import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTransactions, Transaction } from '../context/TransactionContext';
import { useTheme } from '@/context/ThemeContext'; // Import useTheme

interface OverviewProps {
  searchTerm: string;
}

const Overview: React.FC<OverviewProps> = ({ searchTerm }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const { transactions } = useTransactions();
  const { theme } = useTheme(); // Consume theme from context

  // Helper function to aggregate data by month
  const aggregateByMonth = (transactions: Transaction[]) => {
    const initialMonthlyData: { [key: string]: { income: number; expense: number } } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthNames.forEach(month => {
      initialMonthlyData[month] = { income: 0, expense: 0 };
    });

    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const month = monthNames[date.getMonth()];
      if (initialMonthlyData[month]) {
        if (transaction.type === 'income') {
          initialMonthlyData[month].income += transaction.amount;
        } else if (transaction.type === 'expense') {
          initialMonthlyData[month].expense += transaction.amount;
        }
      }
    });

    return monthNames.map(month => ({
      periodLabel: month,
      income: initialMonthlyData[month].income,
      expense: initialMonthlyData[month].expense,
    }));
  };

  // Helper function to aggregate data by quarter
  const aggregateByQuarter = (transactions: Transaction[]) => {
    const quarterlyData: { [key: string]: { income: number; expense: number } } = {
      'Q1': { income: 0, expense: 0 },
      'Q2': { income: 0, expense: 0 },
      'Q3': { income: 0, expense: 0 },
      'Q4': { income: 0, expense: 0 },
    };
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const month = date.getMonth(); // 0-11
      let quarterLabel = '';
      if (month >= 0 && month <= 2) quarterLabel = 'Q1'; // Jan, Feb, Mar
      else if (month >= 3 && month <= 5) quarterLabel = 'Q2'; // Apr, May, Jun
      else if (month >= 6 && month <= 8) quarterLabel = 'Q3'; // Jul, Aug, Sep
      else quarterLabel = 'Q4'; // Oct, Nov, Dec

      if (quarterlyData[quarterLabel]) {
        if (transaction.type === 'income') {
          quarterlyData[quarterLabel].income += transaction.amount;
        } else {
          quarterlyData[quarterLabel].expense += transaction.amount;
        }
      }
    });
    return ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({
      periodLabel: q,
      income: quarterlyData[q].income,
      expense: quarterlyData[q].expense,
    }));
  };

  // Helper function to aggregate data by year
  // Helper function to aggregate data by year
const aggregateByYear = (transactions: Transaction[]) => {
  const yearlyData: { [key: string]: { income: number; expense: number } } = {};
  
  transactions.forEach(transaction => {
    // Ensure the date is parsed correctly.
    // If createdAt is already a JS Date object, skip new Date()
    // If it's a string, ensure it's ISO formatted for robust parsing.
    const date = new Date(transaction.createdAt); 
    
    // Check for invalid dates (e.g., if parsing failed)
    if (isNaN(date.getTime())) {
      console.warn("Invalid date encountered for transaction:", transaction);
      return; // Skip this transaction
    }

    const year = date.getFullYear().toString(); // Get the full year

    if (!yearlyData[year]) {
      yearlyData[year] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'income') {
      yearlyData[year].income += transaction.amount;
    } else {
      yearlyData[year].expense += transaction.amount;
    }
  });

  // Sort years chronologically and convert to array of objects
  const sortedYears = Object.keys(yearlyData).sort((a, b) => parseInt(a) - parseInt(b));
  
  // If no transactions exist for any year, you might want to return a default empty state
  if (sortedYears.length === 0) {
      // Or return an empty array or handle this upstream
      return []; 
  }

  return sortedYears.map(year => ({
    periodLabel: year,
    income: yearlyData[year].income,
    expense: yearlyData[year].expense,
  }));
};

  // Aggregate data based on selectedPeriod
  const { chartData, maxYValue } = useMemo(() => {
    let aggregatedData;
    switch (selectedPeriod) {
      case 'Quarterly':
        aggregatedData = aggregateByQuarter(transactions);
        break;
      case 'Annually':
        aggregatedData = aggregateByYear(transactions);
        break;
      case 'Monthly':
      default:
        aggregatedData = aggregateByMonth(transactions);
        break;
    }

    let currentMaxYValue = 0;
    aggregatedData.forEach(data => {
      currentMaxYValue = Math.max(currentMaxYValue, data.income, data.expense);
    });

    // Ensure max Y value is at least 100 to prevent division by zero or very small scales
    currentMaxYValue = Math.max(currentMaxYValue, 100);

    return { chartData: aggregatedData, maxYValue: currentMaxYValue };
  }, [transactions, selectedPeriod]);

  // Function to generate SVG path data based on aggregated data
  const generatePathD = (dataPoints: number[], chartWidth: number, chartHeight: number, maxValue: number) => {
    if (dataPoints.length === 0) return '';

    // Handle single data point case to prevent division by zero for effectiveLength
    const effectiveLength = Math.max(1, dataPoints.length - 1);

    let pathD = `M 0 ${chartHeight - (dataPoints[0] / maxValue) * chartHeight}`;

    for (let i = 1; i < dataPoints.length; i++) {
      const x = (i / effectiveLength) * chartWidth;
      const y = chartHeight - (dataPoints[i] / maxValue) * chartHeight;
      pathD += ` L ${x} ${y}`;
    }
    return pathD;
  };

  const CHART_DRAWING_WIDTH = 800;
  const CHART_DRAWING_HEIGHT = 200;

  const incomeData = chartData.map(d => d.income);
  const expenseData = chartData.map(d => d.expense);

  const incomePathD = generatePathD(incomeData, CHART_DRAWING_WIDTH, CHART_DRAWING_HEIGHT, maxYValue);
  const expensePathD = generatePathD(expenseData, CHART_DRAWING_WIDTH, CHART_DRAWING_HEIGHT, maxYValue);

  // Generate Y-axis labels dynamically
  const yAxisLabels = useMemo(() => {
    const labels = [];
    const numLabels = 5; // Number of labels, including 0 and max
    const step = maxYValue / numLabels;
    for (let i = numLabels; i >= 0; i--) {
      labels.push(`₹${Math.round(i * step).toLocaleString()}`);
    }
    return labels;
  }, [maxYValue]);

  const lastDataPointIndex = chartData.length > 0 ? chartData.length - 1 : 0;
  const lastPeriodData = chartData[lastDataPointIndex];
  // Changed to Rupee symbol
  const tooltipValue = lastPeriodData ? `₹${(lastPeriodData.income - lastPeriodData.expense).toFixed(2)}` : '₹0.00';

  const tooltipX = chartData.length > 1
    ? (lastDataPointIndex / (chartData.length - 1)) * CHART_DRAWING_WIDTH - 50
    : CHART_DRAWING_WIDTH / 2 - 50;

  const tooltipY = lastPeriodData
    ? CHART_DRAWING_HEIGHT - (lastPeriodData.income / maxYValue) * CHART_DRAWING_HEIGHT - 30
    : CHART_DRAWING_HEIGHT / 2 - 15;


  return (
    <div className={`rounded-xl p-6 mb-8 ${
      theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Overview</h3>

        <div className="flex items-center space-x-4">
          {/* Legend */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Expenses</span>
            </div>
          </div>

          {/* Period Selector */}
          <div className="relative">
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            >
              <span>{selectedPeriod}</span>
              <ChevronDown size={16} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            {showPeriodDropdown && (
              <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-10 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <ul className="py-1">
                  {['Monthly', 'Quarterly', 'Annually'].map((period) => (
                    <li
                      key={period}
                      className={`px-4 py-2 cursor-pointer ${
                        theme === 'dark' ? 'text-white hover:bg-gray-600' : 'text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setShowPeriodDropdown(false);
                      }}
                    >
                      {period}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className={`h-64 rounded-lg p-4 relative overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="absolute inset-4">
          {/* Y-axis labels */}
          <div className={`absolute left-0 top-0 h-full flex flex-col justify-between text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {yAxisLabels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>

          {/* Chart area */}
          <div className="ml-12 h-full relative" style={{ width: `calc(100% - 3rem)` }}>
            <svg viewBox={`0 0 ${CHART_DRAWING_WIDTH} ${CHART_DRAWING_HEIGHT}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              {/* Income line (green) */}
              <path
                d={incomePathD}
                stroke="#10B981"
                strokeWidth="3"
                fill="none"
                className="drop-shadow-sm"
              />
              {/* Expenses line (yellow) */}
              <path
                d={expensePathD}
                stroke="#F59E0B"
                strokeWidth="3"
                fill="none"
                className="drop-shadow-sm"
              />

              {/* Data point for the last period's income */}
              {chartData.length > 0 && (
                <circle
                  cx={chartData.length > 1 ? (lastDataPointIndex / (chartData.length - 1)) * CHART_DRAWING_WIDTH : 0}
                  cy={CHART_DRAWING_HEIGHT - (incomeData[lastDataPointIndex] / maxYValue) * CHART_DRAWING_HEIGHT}
                  r="4"
                  fill="#10B981"
                />
              )}

              {/* Tooltip for the last period's net value */}
              {lastPeriodData && (
                <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                  <rect x="0" y="0" width="100" height="30" rx="6" fill="#10B981" />
                  <text x="50" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                    {tooltipValue}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* X-axis labels */}
          <div className={`absolute bottom-0 left-12 right-0 flex justify-between text-xs mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {chartData.map((data) => (
              <span key={data.periodLabel}>{data.periodLabel}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;