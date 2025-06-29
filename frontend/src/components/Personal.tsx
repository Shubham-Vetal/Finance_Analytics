import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useMessages } from '@/context/MessageContext';
import { useTheme } from '@/context/ThemeContext'; //  Import useTheme

const dummyAvatar =
  'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2';

interface PersonalProps {
  searchTerm: string; // Not directly used in Personal, but passed from DashboardLayout
}

const Personal: React.FC<PersonalProps> = ({ searchTerm }) => {
  const { user, updateUser, logout } = useUser();
  const { addMessage } = useMessages();
  const { theme } = useTheme(); //  Consume theme from context

  const [username, setUsername] = useState(user?.username || '');
  const [email] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!username.trim()) {
      addMessage({ type: 'error', content: 'Username cannot be empty.' });
      return;
    }

    try {
      setLoading(true);
      await updateUser({ username });
      addMessage({ type: 'success', content: 'Profile updated successfully.' });
    } catch (error) {
      console.error(error);
      addMessage({ type: 'error', content: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Use navigate('/login') if you have useNavigate from react-router-dom
      // For now, reload as per original logic
      window.location.reload();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className={`p-6 max-w-3xl mx-auto rounded-xl space-y-8 ${
      theme === 'dark'
        ? 'bg-gray-800 border border-gray-700 text-white'
        : 'bg-white border border-gray-200 text-gray-800'
    }`}>
      <h2 className={`text-2xl font-bold ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Personal Settings</h2>

      {/* Profile Card */}
      <div className="flex items-center space-x-6">
        <img
          src={dummyAvatar}
          alt="Avatar"
          className={`w-24 h-24 rounded-full border-4 object-cover ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
          }`}
        />
        <div>
          <h3 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{user?.username}</h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>{user?.email}</p>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-4">
        <div>
          <label className={`block mb-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
          }`}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-gray-100 text-gray-800 border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className={`block mb-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
          }`}>Email</label>
          <input
            type="email"
            value={email}
            disabled
            className={`w-full px-4 py-2 rounded border cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-400 border-gray-600'
                : 'bg-gray-100 text-gray-500 border-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Extra Info */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <div className={`rounded p-4 border ${
          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
        }`}>
          <p className={`mb-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>User ID</p>
          <p className={`font-mono text-sm ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>{user?._id || 'N/A'}</p>
        </div>
        <div className={`rounded p-4 border ${
          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
        }`}>
          <p className={`mb-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Role</p>
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>user</p>
        </div>
        <div className={`rounded p-4 border ${
          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
        }`}>
          <p className={`mb-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Joined</p>
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Personal;