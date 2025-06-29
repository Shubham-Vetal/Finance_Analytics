import { createContext, useContext, useState, ReactNode } from 'react';

type MessageType = 'info' | 'success' | 'error';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

interface MessageContextType {
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  unseenCount: number;
  markAllAsSeen: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unseenCount, setUnseenCount] = useState<number>(0);

  const addMessage = ({ type, content }: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [newMessage, ...prev]);
    setUnseenCount(prev => prev + 1); // Increment unseen messages
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const clearMessages = () => {
    setMessages([]);
    setUnseenCount(0);
  };

  const markAllAsSeen = () => {
    setUnseenCount(0);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage, removeMessage, clearMessages, unseenCount, markAllAsSeen }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error('useMessages must be used inside a MessageProvider');
  return ctx;
};
