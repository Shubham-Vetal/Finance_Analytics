import React from 'react';
import { LayoutDashboard, CreditCard, Wallet, BarChart3, User, MessageSquare, Settings } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext'; //  Import useTheme

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const { theme } = useTheme(); //  Consume theme from context

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'transactions', icon: CreditCard, label: 'Transactions' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'personal', icon: User, label: 'Personal' },
    { id: 'message', icon: MessageSquare, label: 'Message' },
    { id: 'setting', icon: Settings, label: 'Setting' },
  ];

  return (
    <div className={`w-64 h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50 border-r border-gray-200' //  Change background for light theme
    }`}>
      {/* Logo */}
      <div className={`p-6 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200' //  Change border for light theme
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className={`font-semibold text-xl ${
            theme === 'dark' ? 'text-white' : 'text-gray-900' //  Change logo text color
          }`}>Penta</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-green-500 text-white shadow-lg' // Active item remains distinct
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' // Dark theme non-active
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200' //  Light theme non-active
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;