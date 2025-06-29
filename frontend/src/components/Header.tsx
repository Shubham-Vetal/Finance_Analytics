import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTransactions } from '../context/TransactionContext'; // Not directly used for display, but good to keep if needed later
import { useMessages } from '@/context/MessageContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext'; // ✅ Import useTheme

const AVATAR_URL =
  'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2';

interface HeaderProps {
  setActiveItem: (item: string) => void;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const Header: React.FC<HeaderProps> = ({ setActiveItem, setSearchTerm }) => {
  const { user, logout } = useUser();
  const { messages, unseenCount, markAllAsSeen } = useMessages();
  const { theme } = useTheme(); // ✅ Consume theme from context
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [bellAnimationKey, setBellAnimationKey] = useState(0);
  const prevMessageCount = useRef(messages.length);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      setBellAnimationKey(prev => prev + 1);
    }
    prevMessageCount.current = messages.length;
  }, [messages.length]);

  const handleNotificationClick = () => {
    setActiveItem('message');
    markAllAsSeen();
  };

  return (
    <header className={`px-6 py-4 border-b shadow-sm font-inter ${
      theme === 'dark' ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-semibold tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Finance App
        </h1>

        <div className="flex items-center space-x-6 relative">
          <div className="relative hidden md:block">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} size={18} />
            <input
              type="text"
              placeholder="Search..."
              className={`pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition ${
                theme === 'dark'
                  ? 'bg-[#1e293b] text-white placeholder-gray-400 border-[#334155]'
                  : 'bg-gray-100 text-gray-800 placeholder-gray-500 border-gray-300'
              }`}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className={`relative p-2 transition-colors ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={handleNotificationClick}
          >
            <Bell
              key={bellAnimationKey}
              size={20}
              className={unseenCount > 0 ? 'text-blue-400 animate-pulse-once' : ''}
            />
            {unseenCount > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center ring-2 font-bold ${
                theme === 'dark' ? 'ring-[#0f172a]' : 'ring-white' // Ring color changes based on header background
              }`}>
                {unseenCount}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500 transition hover:scale-105"
            >
              <img src={AVATAR_URL} alt="Avatar" className="w-full h-full object-cover" />
            </button>

            {isDropdownOpen && (
              <div
                className={`absolute right-0 mt-3 w-72 rounded-xl shadow-xl z-50 p-5 text-sm animate-fade-in ${
                  theme === 'dark' ? 'bg-[#1e293b]' : 'bg-white border border-gray-200'
                }`}
                style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={AVATAR_URL}
                    alt="Avatar"
                    className={`w-12 h-12 rounded-full object-cover ${
                      theme === 'dark' ? 'border border-gray-600' : 'border border-gray-300'
                    }`}
                  />
                  <div>
                    <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.username}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user?.email}</p>
                  </div>
                </div>

                <hr className={`my-3 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setActiveItem('personal');
                  }}
                  className={`w-full py-2 rounded-md transition-colors text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  More
                </button>

                <button
                  onClick={logout}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-semibold"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation-fill-mode: both;
        }

        @keyframes pulse-once {
          0% { transform: scale(1); opacity: 1; }
          25% { transform: scale(1.1); opacity: 0.9; }
          50% { transform: scale(1); opacity: 1; }
          75% { transform: scale(1.1); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-once {
          animation: pulse-once 2s forwards;
        }
      `}</style>
    </header>
  );
};

export default Header;