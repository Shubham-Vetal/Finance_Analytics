import React, { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import Overview from '@/components/Overview';
import RecentTransactions from '@/components/RecentTransactions';
import TransactionsTable from '@/components/TransactionsTable';
import Analytics from '@/components/Analytics';
import Wallet from '@/components/Wallet';
import Personal from '@/components/Personal';
import Messages from '@/components/Messages';
import Settings from '@/components/Settings';
import { useTheme } from '@/context/ThemeContext'; //  Import useTheme

function DashboardLayout() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const transactionsTableRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useTheme(); //  Consume theme from context

  const scrollToTransactionsTable = () => {
    if (transactionsTableRef.current) {
      transactionsTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderMainContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return (
          <>
            <StatsCards searchTerm={searchTerm} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <Overview searchTerm={searchTerm} />
              </div>
              <div className="lg:col-span-1">
                <RecentTransactions
                  onSeeAllClick={() => setActiveItem('transactions')}
                />
              </div>
            </div>
            <div ref={transactionsTableRef} className="flex-1">
              <TransactionsTable />
            </div>
          </>
        );
      case 'transactions':
        return (
          // Applied theme text color here
          <div className={`max-w-7xl mx-auto w-full flex flex-col space-y-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <h2 className="text-2xl font-bold mb-4">All Transactions</h2>
            <TransactionsTable />
          </div>
        );
      case 'analytics':
        return <Analytics searchTerm={searchTerm} />;
      case 'wallet':
        return <Wallet searchTerm={searchTerm} />;
      case 'personal':
        return <Personal searchTerm={searchTerm} />;
      case 'message':
        return (
          <div className="flex-1 overflow-y-auto">
            <Messages searchTerm={searchTerm} />
          </div>
        );
      case 'setting':
        return (
          <div className="flex-1 overflow-y-auto">
            <Settings />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    //  Applied theme background color to the main container
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setActiveItem={setActiveItem} setSearchTerm={setSearchTerm} />
        {/* Applied theme background color to the main content area */}
        <main className={`flex-1 flex flex-col p-8 overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="max-w-7xl mx-auto w-full flex flex-col">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;