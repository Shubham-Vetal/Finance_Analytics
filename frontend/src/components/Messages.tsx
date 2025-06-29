import React, { useMemo } from 'react';
import { useMessages } from '@/context/MessageContext';
import { X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext'; // ✅ Import useTheme

interface MessagesProps {
  searchTerm: string;
}

const Messages: React.FC<MessagesProps> = ({ searchTerm }) => {
  const { messages, removeMessage, clearMessages } = useMessages();
  const { theme } = useTheme(); // ✅ Consume theme from context


  const filteredMessages = useMemo(() => {
    if (!searchTerm) {
      return messages;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return messages.filter(message =>
      (message.content || '').toLowerCase().includes(lowerCaseSearchTerm) ||
      message.timestamp.toLocaleDateString().toLowerCase().includes(lowerCaseSearchTerm) ||
      message.timestamp.toLocaleTimeString().toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [messages, searchTerm]);

  return (
    <div className={`max-w-3xl mx-auto p-6 w-full ${
      theme === 'dark' ? 'text-white' : 'text-gray-800' // Apply base text color for the component
    }`}>
      <div className={`flex justify-between items-center mb-6 border-b pb-2 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
      }`}>
        <h2 className={`text-2xl font-semibold tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Notifications</h2>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className={`text-sm hover:text-red-400 transition-colors ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Clear All
          </button>
        )}
      </div>


      {filteredMessages.length === 0 ? (
        <p className={`text-center mt-20 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
        }`}>
          {searchTerm ? `No notifications found for "${searchTerm}".` : 'No notifications available.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {filteredMessages.map((msg) => (
            <li
              key={msg.id}
              className={`p-4 rounded-lg shadow-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="pr-4">
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => removeMessage(msg.id)}
                  className={`p-1 hover:text-red-400 transition-colors ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Messages;