import React, { useState, useMemo, useEffect, useCallback } from 'react'; // Added useCallback
import { PlusCircle, MinusCircle, Wallet as WalletIcon, TrendingUp, X } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTransactions, Transaction } from '../context/TransactionContext'; // Import Transaction
import { useUser } from '../context/UserContext';
import { useMessages } from '@/context/MessageContext';
import { useTheme } from '@/context/ThemeContext';

interface WalletProps {
  searchTerm: string; // This prop is not used in the current Wallet component logic. Consider removing if truly unused.
}

const Wallet: React.FC<WalletProps> = ({ searchTerm }) => {
  // ✅ MODIFIED: Destructure getSummary from useTransactions
  const { transactions, addTransaction, getSummary } = useTransactions();
  const { user } = useUser();
  const { addMessage } = useMessages();
  const { theme } = useTheme();

  // ✅ MODIFIED: Use a separate state for currentBalance, fetched from getSummary
  const [currentBalance, setCurrentBalance] = useState<number | null>(null); // Initialize as null to indicate loading
  const [loading, setLoading] = useState(true); // Still true until transactions and currentBalance are loaded

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // ✅ NEW: Callback to fetch the current balance from the backend summary
  const fetchCurrentBalance = useCallback(async () => {
    try {
      const summary = await getSummary();
      const income = summary.find(item => item._id === 'income')?.total || 0;
      const expense = summary.find(item => item._id === 'expense')?.total || 0;
      setCurrentBalance(income - expense);
    } catch (error) {
      console.error('Error fetching current balance:', error);
      setCurrentBalance(0); // Default to 0 on error
      addMessage({ type: 'error', content: 'Failed to load wallet balance.' });
    }
  }, [getSummary, addMessage]); // Depend on getSummary and addMessage

  // ✅ MODIFIED: useEffect to load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCurrentBalance(); // Fetch the current balance
      // transactions are already fetched by TransactionProvider's useEffect,
      // and then provided via the context. We just need to know when they are available.
      if (transactions !== null) { // This check might be redundant if transactions is guaranteed array
         setLoading(false);
      }
    };
    loadData();
  }, [fetchCurrentBalance, transactions]); // Depend on fetchCurrentBalance and transactions for initial load

  // Calculate balance history (still based on local 'transactions' state for the chart)
  const balanceHistoryData = useMemo(() => {
    let balance = 0;
    const history: { date: string; balance: number }[] = [];

    // Filter for completed transactions for history calculation, matching summary logic
    const completedTransactions = transactions.filter(tx => tx.status === 'completed');

    const sortedTransactions = [...completedTransactions].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedTransactions.forEach(tx => {
      if (tx.type === 'income') {
        balance += tx.amount;
      } else if (tx.type === 'expense') {
        balance -= tx.amount;
      }
      // Format date to 'MM/DD/YYYY' for consistency, or whatever format Recharts expects for XAxis
      const txDate = new Date(tx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

      // If there are multiple transactions on the same day, update the balance for that day
      if (history.length > 0 && history[history.length - 1].date === txDate) {
        history[history.length - 1].balance = balance;
      } else {
        history.push({ date: txDate, balance });
      }
    });

    // Add a starting point of 0 balance if there are transactions,
    // or if no transactions exist, ensure at least one data point for the chart.
    if (history.length > 0) {
        // If the first recorded transaction date is not the first day in history,
        // add a point for the day *before* the first transaction with a 0 balance.
        // This makes the chart start from 0.
        const firstTxDate = new Date(sortedTransactions[0]?.createdAt || new Date());
        const dayBeforeFirstTx = new Date(firstTxDate);
        dayBeforeFirstTx.setDate(firstTxDate.getDate() - 1);

        const firstHistoryDate = new Date(history[0].date);
        // Add a zero point only if the first transaction wasn't on the first day of recorded history (i.e., if it didn't start at 0)
        if (firstHistoryDate.toDateString() !== dayBeforeFirstTx.toDateString() && history[0].balance !== 0) {
            history.unshift({ date: dayBeforeFirstTx.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }), balance: 0 });
        }
    } else {
      // If no transactions at all, show 0 balance for today
      history.push({ date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }), balance: 0 });
    }


    console.log("🟩 Balance History Data for Chart:", history); // Debugging
    return history;
  }, [transactions]); // Re-run when transactions change

  // Get recent transactions for activity list (still based on local 'transactions' state)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [transactions]);


  const handleDeposit = async () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      setFeedbackMessage({ type: 'error', message: 'Please enter a valid positive amount.' });
      addMessage({ type: 'error', content: 'Invalid deposit amount.' });
      return;
    }

    try {
      await addTransaction({
        amount: amount,
        category: 'Deposit',
        type: 'income',
        status: 'completed',
        description: descriptionInput || 'Wallet Deposit',
      });
      await fetchCurrentBalance(); // ✅ IMPORTANT: Re-fetch balance after a transaction
      addMessage({ type: 'success', content: `₹${amount.toFixed(2)} deposited to your wallet.` });
      setFeedbackMessage({ type: 'success', message: 'Deposit successful!' });
      setShowDepositModal(false);
      setAmountInput('');
      setDescriptionInput('');
    } catch (error) {
      console.error('Deposit error:', error);
      addMessage({ type: 'error', content: 'Failed to process deposit. Please try again.' });
      setFeedbackMessage({ type: 'error', message: 'Failed to process deposit. Please try again.' });
    }

    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      setFeedbackMessage({ type: 'error', message: 'Please enter a valid positive amount.' });
      addMessage({ type: 'error', content: 'Invalid withdrawal amount.' });
      return;
    }
    // ✅ MODIFIED: Use currentBalance from state, which comes from getSummary
    if (currentBalance === null || amount > currentBalance) { // Check for null currentBalance too
      setFeedbackMessage({ type: 'error', message: 'Insufficient balance for withdrawal.' });
      addMessage({ type: 'error', content: 'Withdrawal failed due to insufficient balance.' });
      return;
    }

    try {
      await addTransaction({
        amount: amount,
        category: 'Withdrawal',
        type: 'expense',
        status: 'completed',
        description: descriptionInput || 'Wallet Withdrawal',
      });
      await fetchCurrentBalance(); // ✅ IMPORTANT: Re-fetch balance after a transaction
      addMessage({ type: 'success', content: `₹${amount.toFixed(2)} withdrawn from your wallet.` });
      setFeedbackMessage({ type: 'success', message: 'Withdrawal successful!' });
      setShowWithdrawModal(false);
      setAmountInput('');
      setDescriptionInput('');
    } catch (error) {
      console.error('Withdrawal error:', error);
      addMessage({ type: 'error', content: 'Failed to process withdrawal. Please try again.' });
      setFeedbackMessage({ type: 'error', message: 'Failed to process withdrawal. Please try again.' });
    }

    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const renderLoadingState = () => (
    <div className={`flex items-center justify-center h-full py-20 ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }`}>
      Loading wallet data...
    </div>
  );

  const renderChartNoDataState = () => (
    <div className={`flex items-center justify-center h-full ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }`}>
      Add transactions to see your balance history!
    </div>
  );

  return (
    <div className={`rounded-xl p-6 h-full flex flex-col ${
      theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      <h3 className={`text-xl font-semibold mb-6 flex items-center space-x-2 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        <WalletIcon size={24} />
        <span>{user ? `${user.username}'s Wallet` : 'Your Wallet'}</span>
      </h3>

      {feedbackMessage && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${
          feedbackMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {feedbackMessage.message}
        </div>
      )}

      {/* ✅ MODIFIED: Loading state also depends on currentBalance being null (not yet fetched) */}
      {loading || currentBalance === null ? renderLoadingState() : (
        <div className="flex flex-col flex-1 w-full">
          {/* Current Balance Card */}
          <div className={`rounded-lg p-6 mb-6 flex items-center justify-between shadow-md ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Current Balance</p>
              <p className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{currentBalance.toFixed(2)}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => { setShowDepositModal(true); setAmountInput(''); setDescriptionInput(''); setFeedbackMessage(null); }}
              >
                <PlusCircle size={20} />
                <span>Deposit</span>
              </button>
              <button
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => { setShowWithdrawModal(true); setAmountInput(''); setDescriptionInput(''); setFeedbackMessage(null); }}
              >
                <MinusCircle size={20} />
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* Balance History Chart */}
          <div className={`rounded-lg p-4 mb-6 h-[250px] shadow-md flex flex-col ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <TrendingUp size={20} />
              <span>Balance History</span>
            </h4>
            {balanceHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" aspect={3}>
                <LineChart
                  data={balanceHistoryData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4B5563' : '#D1D5DB'} />
                  <XAxis dataKey="date" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #D1D5DB',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: theme === 'dark' ? '#E5E7EB' : '#1F2937' }}
                    itemStyle={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Balance']}
                  />
                  <Line type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : renderChartNoDataState()}
          </div>

          {/* Recent Activity */}
          <div className={`rounded-lg p-4 shadow-md flex-1 flex flex-col ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Recent Activity</h4>
            {recentTransactions.length > 0 ? (
              <ul className="space-y-3 overflow-y-auto max-h-[250px]">
                {recentTransactions.map(tx => (
                  <li key={tx._id} className={`flex items-center justify-between p-3 rounded-md ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                        tx.type === 'income' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}>
                        {tx.type === 'income' ? 'IN' : 'OUT'}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{tx.description || tx.category}</p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>No recent activity.</p>
            )}
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-full max-w-md border space-y-4 ${
            theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'
          }`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Deposit Funds</h2>
              <button onClick={() => setShowDepositModal(false)}>
                <X className={`${theme === 'dark' ? 'text-white hover:text-gray-400' : 'text-gray-600 hover:text-gray-800'}`} />
              </button>
            </div>
            <input
              type="number"
              placeholder="Amount"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className={`w-full p-2 rounded border ${
                theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
              }`}
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              className={`w-full p-2 rounded border ${
                theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
              }`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeposit}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-full max-w-md border space-y-4 ${
            theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'
          }`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Withdraw Funds</h2>
              <button onClick={() => setShowWithdrawModal(false)}>
                <X className={`${theme === 'dark' ? 'text-white hover:text-gray-400' : 'text-gray-600 hover:text-gray-800'}`} />
              </button>
            </div>
            <input
              type="number"
              placeholder="Amount"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className={`w-full p-2 rounded border ${
                theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
              }`}
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              className={`w-full p-2 rounded border ${
                theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
              }`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleWithdrawal}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;