import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Switch } from '@headlessui/react';
import { saveAs } from 'file-saver';
import { useTransactions, Transaction } from '../context/TransactionContext';
import { useMessages } from '@/context/MessageContext';
import { useUserConfig } from '@/context/UserConfigContext';
import { useTheme } from '@/context/ThemeContext'; //  Import useTheme
import { toast } from 'sonner';

const availableExportColumns = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Status'];

const Settings: React.FC = () => {
  const { transactions } = useTransactions();
  const { addMessage } = useMessages();
  const { user, updateUser, changePassword } = useUser();
  const { csvColumns, saveConfig } = useUserConfig();
  const { theme, setTheme } = useTheme(); //  Consume theme and setTheme from context

  // Local state for other settings
  const [enable2FA, setEnable2FA] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [passwordInputs, setPasswordInputs] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [selectedExportColumns, setSelectedExportColumns] = useState<string[]>([]);

  // Sync local state with csvColumns from context on initial load or context change
  useEffect(() => {
    setSelectedExportColumns(csvColumns);
  }, [csvColumns]);


  const exportAsCSV = () => {
    const columnMap: { [key: string]: keyof Transaction | ((tx: Transaction) => string) } = {
      'Date': (tx: Transaction) => new Date(tx.createdAt).toLocaleDateString(),
      'Type': 'type',
      'Amount': (tx: Transaction) => tx.amount.toFixed(2),
      'Category': 'category',
      'Description': 'description',
      'Status': 'status',
    };

    const headers = selectedExportColumns.length > 0 ? selectedExportColumns : availableExportColumns;

    const csvRows = transactions.map(tx => {
      return headers.map(header => {
        const property = columnMap[header];
        let value: string;
        if (typeof property === 'function') {
          value = property(tx);
        } else {
          value = tx[property] !== undefined && tx[property] !== null ? String(tx[property]) : '';
        }
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'transactions.csv');
    addMessage({ type: 'success', content: 'Exported CSV successfully!' });
  };

  const exportAsJSON = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
    saveAs(blob, 'transactions.json');
    addMessage({ type: 'success', content: 'Exported JSON successfully!' });
  };

  const handleChangePassword = async () => {
    const { current, new: newPass, confirm } = passwordInputs;

    if (!current || !newPass || !confirm) {
      addMessage({ type: 'error', content: 'All password fields are required.' });
      return;
    }

    if (newPass !== confirm) {
      addMessage({ type: 'error', content: 'New passwords do not match.' });
      return;
    }

    try {
      await changePassword(current, newPass);
      setPasswordInputs({ current: '', new: '', confirm: '' });
      addMessage({ type: 'success', content: 'Password changed successfully!' });
      toast('Password changed successfully 🔒', {
        description: 'Your password was updated securely.',
        action: {
          label: 'Undo',
          onClick: () => {
            console.log('Undo clicked');
          },
        },
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update password.';
      addMessage({ type: 'error', content: msg });
      toast.error('Password update failed', {
        description: msg,
      });
    }
  };

  const handleColumnToggle = (column: string) => {
    setSelectedExportColumns(prev =>
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  };

  const handleSaveColumns = async () => {
    try {
      await saveConfig(selectedExportColumns);
      addMessage({ type: 'success', content: 'CSV export preferences saved!' });
    } catch (error) {
      console.error('Failed to save CSV export preferences:', error);
      addMessage({ type: 'error', content: 'Failed to save CSV export preferences.' });
    }
  };

  return (
    <div className={`p-6 max-w-3xl mx-auto rounded-xl border space-y-8 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Settings</h2>

      <div>
        <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark')} //  Update theme via context
          className={`p-2 rounded w-full ${
            theme === 'dark'
              ? 'bg-gray-700 border border-gray-600 text-white'
              : 'bg-gray-100 border border-gray-300 text-gray-800'
          }`}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div className="space-y-2">
        <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Export Transactions</p>
        <div className="flex gap-3">
          <button
            onClick={exportAsCSV}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm text-white"
          >
            Export CSV
          </button>
          <button
            onClick={exportAsJSON}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm text-white"
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Customize CSV Export Columns</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableExportColumns.map(column => (
            <label key={column} className={`flex items-center space-x-2 cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              <input
                type="checkbox"
                checked={selectedExportColumns.includes(column)}
                onChange={() => handleColumnToggle(column)}
                className="form-checkbox h-4 w-4 text-green-600 rounded focus:ring-green-500"
              />
              <span>{column}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleSaveColumns}
          className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-semibold text-white"
        >
          Save Column Preferences
        </button>
      </div>

      <div className="space-y-2">
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Change Password</p>
        <input
          type="password"
          placeholder="Current Password"
          value={passwordInputs.current}
          onChange={(e) => setPasswordInputs({ ...passwordInputs, current: e.target.value })}
          className={`w-full p-2 rounded ${
            theme === 'dark'
              ? 'bg-gray-700 border border-gray-600 text-white'
              : 'bg-gray-100 border border-gray-300 text-gray-800'
          }`}
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwordInputs.new}
          onChange={(e) => setPasswordInputs({ ...passwordInputs, new: e.target.value })}
          className={`w-full p-2 rounded ${
            theme === 'dark'
              ? 'bg-gray-700 border border-gray-600 text-white'
              : 'bg-gray-100 border border-gray-300 text-gray-800'
          }`}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={passwordInputs.confirm}
          onChange={(e) => setPasswordInputs({ ...passwordInputs, confirm: e.target.value })}
          className={`w-full p-2 rounded ${
            theme === 'dark'
              ? 'bg-gray-700 border border-gray-600 text-white'
              : 'bg-gray-100 border border-gray-300 text-gray-800'
          }`}
        />
        <button
          onClick={handleChangePassword}
          className="mt-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm text-white"
        >
          Change Password
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Enable Two-Factor Authentication</span>
        <Switch
          checked={enable2FA}
          onChange={setEnable2FA}
          className={`${enable2FA ? 'bg-green-500' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${enable2FA ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>

      <div>
        <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Notifications</p>
        <div className="space-y-2">
          <label className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
            <span>Email Notifications</span>
          </label>
          <label className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <input type="checkbox" checked={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />
            <span>SMS Notifications</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;